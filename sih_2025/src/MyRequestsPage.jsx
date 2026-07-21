import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    updateDoc,
    arrayUnion,
    runTransaction,
    getDocs
} from 'firebase/firestore';
import { auth, db } from './firebaseClient.js';

const MAX_TEAM_SIZE = 6;

export default function MyRequestsPage({ showToast, showAlert }) {
    const [incomingJoinRequests, setIncomingJoinRequests] = useState([]);
    const [invitesReceived, setInvitesReceived] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [invitesSent, setInvitesSent] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actingOn, setActingOn] = useState(null);

    useEffect(() => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            showAlert && showAlert('Please login first');
            setLoading(false);
            return;
        }
        const uid = currentUser.uid;

        let unsubIncoming = null;
        let unsubInvitesSent = null;
        let pending = 3; // teamQuery, invitesReceived, sent — decremented as each resolves once

        const markLoaded = () => {
            pending = Math.max(0, pending - 1);
            if (pending === 0) setLoading(false);
        };

        // ---- Team leadership listener (drives incoming + invitesSent) ----
        const teamQuery = query(collection(db, 'teams'), where('leader.uid', '==', uid));
        const unsubTeam = onSnapshot(teamQuery, (teamSnap) => {
            const teamDoc = teamSnap.docs[0] ? { id: teamSnap.docs[0].id, ...teamSnap.docs[0].data() } : null;
            setMyTeam(teamDoc);

            if (unsubIncoming) { unsubIncoming(); unsubIncoming = null; }
            if (unsubInvitesSent) { unsubInvitesSent(); unsubInvitesSent = null; }

            if (teamDoc) {
                const incomingQuery = query(
                    collection(db, 'requests'),
                    where('teamId', '==', teamDoc.id),
                    where('initiatedBy', '==', 'individual'),
                    where('status', '==', 'pending')
                );
                unsubIncoming = onSnapshot(incomingQuery, (snap) => {
                    setIncomingJoinRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                });

                const invitesSentQuery = query(
                    collection(db, 'requests'),
                    where('teamId', '==', teamDoc.id),
                    where('initiatedBy', '==', 'leader')
                );
                unsubInvitesSent = onSnapshot(invitesSentQuery, (snap) => {
                    setInvitesSent(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                });
            } else {
                setIncomingJoinRequests([]);
                setInvitesSent([]);
            }

            markLoaded();
        }, (err) => {
            console.error('Failed to load team:', err);
            markLoaded();
        });

        // ---- Invites received ----
        const invitesReceivedQuery = query(
            collection(db, 'requests'),
            where('individualUid', '==', uid),
            where('initiatedBy', '==', 'leader'),
            where('status', '==', 'pending')
        );
        const unsubInvitesReceived = onSnapshot(invitesReceivedQuery, (snap) => {
            setInvitesReceived(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            markLoaded();
        }, (err) => {
            console.error('Failed to load invites:', err);
            markLoaded();
        });

        // ---- Requests I sent ----
        const sentQuery = query(
            collection(db, 'requests'),
            where('individualUid', '==', uid),
            where('initiatedBy', '==', 'individual')
        );
        const unsubSent = onSnapshot(sentQuery, (snap) => {
            setSentRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            markLoaded();
        }, (err) => {
            console.error('Failed to load sent requests:', err);
            markLoaded();
        });

        return () => {
            unsubTeam();
            unsubInvitesReceived();
            unsubSent();
            if (unsubIncoming) unsubIncoming();
            if (unsubInvitesSent) unsubInvitesSent();
        };
    }, []);

    const acceptRequest = async (req) => {
        try {
            setActingOn(req.id);

            const teamRef = doc(db, 'teams', req.teamId);
            const requestRef = doc(db, 'requests', req.id);
            const individualRef = doc(db, 'users', req.individualUid);

            await runTransaction(db, async (transaction) => {
                const [teamSnap, requestSnap, individualSnap] = await Promise.all([
                    transaction.get(teamRef),
                    transaction.get(requestRef),
                    transaction.get(individualRef),
                ]);

                if (!requestSnap.exists() || requestSnap.data().status !== 'pending') {
                    throw new Error('This request is no longer valid — it may have already been handled.');
                }
                if (!teamSnap.exists()) {
                    throw new Error('This team no longer exists.');
                }

                const teamData = teamSnap.data();
                const currentSize = 1 + (teamData.members?.length || 0);
                if (currentSize >= MAX_TEAM_SIZE) {
                    throw new Error('This team is already full.');
                }

                if (!individualSnap.exists() || individualSnap.data().teamId) {
                    throw new Error(`${req.individualName} has already joined another team.`);
                }

                transaction.update(teamRef, {
                    members: arrayUnion({
                        uid: req.individualUid,
                        name: req.individualName,
                        year: req.individualYear,
                        branch: req.individualBranch,
                        contactNumber: req.individualContact || '',
                        skills: req.individualSkills || [],
                    }),
                });
                transaction.update(individualRef, { teamId: req.teamId });
                transaction.update(requestRef, { status: 'accepted' });
            });

            // Best-effort cleanup — not transactional. If a stale request slips
            // through here, the transaction's own teamId check above will safely
            // reject it next time someone tries to accept it.
            const otherReqsSnap = await getDocs(
                query(
                    collection(db, 'requests'),
                    where('individualUid', '==', req.individualUid),
                    where('status', '==', 'pending')
                )
            );
            await Promise.all(
                otherReqsSnap.docs
                    .filter(d => d.id !== req.id)
                    .map(d => updateDoc(doc(db, 'requests', d.id), { status: 'cancelled' }))
            );

            showToast && showToast(`${req.individualName} added to ${req.teamName}!`);

        } catch (err) {
            console.error('Failed to accept request:', err);
            showAlert && showAlert(err.message || 'Failed to accept request.');
        } finally {
            setActingOn(null);
        }
    };

    const rejectRequest = async (id) => {
        try {
            setActingOn(id);
            await updateDoc(doc(db, 'requests', id), { status: 'rejected' });
            showToast && showToast('Request rejected.');
        } catch (err) {
            console.error('Failed to reject request:', err);
            showAlert && showAlert('Failed to reject request.');
        } finally {
            setActingOn(null);
        }
    };

    const cancelInvite = async (id) => {
        try {
            setActingOn(id);
            await updateDoc(doc(db, 'requests', id), { status: 'cancelled' });
            showToast && showToast('Invite cancelled.');
        } catch (err) {
            console.error('Failed to cancel invite:', err);
            showAlert && showAlert('Failed to cancel invite.');
        } finally {
            setActingOn(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="max-w-5xl mx-auto space-y-12">
                <h1 className="text-4xl font-black text-blue-900 text-center">My Requests</h1>

                {myTeam && (
                    <section>
                        <h2 className="text-2xl font-bold text-blue-900 mb-4">
                            Join Requests — {myTeam.teamName} ({1 + (myTeam.members?.length || 0)}/{MAX_TEAM_SIZE})
                        </h2>
                        {incomingJoinRequests.length === 0 ? (
                            <p className="text-slate-500">No incoming join requests.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {incomingJoinRequests.map((req) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                    >
                                        <p className="font-semibold text-blue-900 text-lg">{req.individualName}</p>
                                        <p className="text-sm text-slate-500 mb-2">{req.individualBranch} — {req.individualYear}</p>
                                        <p className="text-sm text-slate-500 mb-3">Contact: {req.individualContact || '—'}</p>
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(req.individualSkills || []).map((skill, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">{skill}</span>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => acceptRequest(req)} disabled={actingOn === req.id} className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 rounded-xl font-semibold">Accept</button>
                                            <button onClick={() => rejectRequest(req.id)} disabled={actingOn === req.id} className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 rounded-xl font-semibold">Reject</button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section>
                    <h2 className="text-2xl font-bold text-blue-900 mb-4">Team Invites Received</h2>
                    {invitesReceived.length === 0 ? (
                        <p className="text-slate-500">No team invites.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {invitesReceived.map((req) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                >
                                    <p className="font-semibold text-blue-900 text-lg">{req.teamName}</p>
                                    <p className="text-sm text-slate-500 mb-4">invited you to join their team</p>
                                    <div className="flex gap-2">
                                        <button onClick={() => acceptRequest(req)} disabled={actingOn === req.id} className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 rounded-xl font-semibold">Accept</button>
                                        <button onClick={() => rejectRequest(req.id)} disabled={actingOn === req.id} className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 rounded-xl font-semibold">Reject</button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-blue-900 mb-4">Requests Sent</h2>
                    {sentRequests.length === 0 ? (
                        <p className="text-slate-500">No sent requests.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sentRequests.map((req) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                >
                                    <p className="font-semibold text-blue-900">{req.teamName}</p>
                                    <p className="text-sm mt-2">Status: <span className="font-medium capitalize">{req.status}</span></p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>

                {myTeam && (
                    <section>
                        <h2 className="text-2xl font-bold text-blue-900 mb-4">Invites Sent</h2>
                        {invitesSent.length === 0 ? (
                            <p className="text-slate-500">No invites sent yet.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {invitesSent.map((req) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                    >
                                        <p className="font-semibold text-blue-900">{req.individualName}</p>
                                        <p className="text-sm mt-2">Status: <span className="font-medium capitalize">{req.status}</span></p>
                                        {req.status === 'pending' && (
                                            <button onClick={() => cancelInvite(req.id)} disabled={actingOn === req.id} className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-slate-700 py-2 rounded-xl font-semibold text-sm">
                                                Cancel Invite
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                )}
            </div>
        </div>
    );
}