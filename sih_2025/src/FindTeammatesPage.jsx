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
    getDocs,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebaseClient.js';

const MAX_TEAM_SIZE = 6;

export default function MyRequestsPage({ showToast, showAlert }) {
    const [incomingJoinRequests, setIncomingJoinRequests] = useState([]);
    const [invitesReceived, setInvitesReceived] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [invitesSent, setInvitesSent] = useState([]);

    // ---- Peer "Team Up" requests ----
    const [peerReceived, setPeerReceived] = useState([]); // team-up requests sent TO me
    const [peerSent, setPeerSent] = useState([]);         // team-up requests I sent

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
        let pending = 5; // teamQuery, invitesReceived, sent, peerReceived, peerSent
        let settled = false;

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

            if (!settled) markLoaded();
        }, (err) => {
            console.error('Failed to load team:', err);
            if (!settled) markLoaded();
        });

        // ---- Invites received (leader -> me) ----
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

        // ---- Requests I sent (me -> team, join request) ----
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

        // ---- Peer "Team Up" requests received (someone -> me) ----
        const peerReceivedQuery = query(
            collection(db, 'requests'),
            where('toUid', '==', uid),
            where('initiatedBy', '==', 'peer'),
            where('status', '==', 'pending')
        );
        const unsubPeerReceived = onSnapshot(peerReceivedQuery, (snap) => {
            setPeerReceived(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            markLoaded();
        }, (err) => {
            console.error('Failed to load team-up requests:', err);
            markLoaded();
        });

        // ---- Peer "Team Up" requests I sent (me -> someone) ----
        const peerSentQuery = query(
            collection(db, 'requests'),
            where('fromUid', '==', uid),
            where('initiatedBy', '==', 'peer')
        );
        const unsubPeerSent = onSnapshot(peerSentQuery, (snap) => {
            setPeerSent(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            markLoaded();
        }, (err) => {
            console.error('Failed to load sent team-up requests:', err);
            markLoaded();
        });

        return () => {
            settled = true;
            unsubTeam();
            unsubInvitesReceived();
            unsubSent();
            unsubPeerReceived();
            unsubPeerSent();
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

    // ---- Peer "Team Up" actions ----

    const acceptPeerRequest = async (req) => {
        try {
            setActingOn(req.id);
            const currentUser = auth.currentUser;
            if (!currentUser) { showAlert && showAlert('Please login first'); return; }

            const requestRef = doc(db, 'requests', req.id);
            const fromUserRef = doc(db, 'users', req.fromUid);
            const toUserRef = doc(db, 'users', currentUser.uid);
            const newTeamRef = doc(collection(db, 'teams'));

            await runTransaction(db, async (transaction) => {
                const [requestSnap, fromSnap, toSnap] = await Promise.all([
                    transaction.get(requestRef),
                    transaction.get(fromUserRef),
                    transaction.get(toUserRef),
                ]);

                if (!requestSnap.exists() || requestSnap.data().status !== 'pending') {
                    throw new Error('This request is no longer valid — it may have already been handled.');
                }
                if (!fromSnap.exists() || !toSnap.exists()) {
                    throw new Error('One of the users no longer exists.');
                }

                const fromData = fromSnap.data();
                const toData = toSnap.data();

                if (fromData.teamId) {
                    throw new Error(`${req.fromName} has already joined another team.`);
                }
                if (toData.teamId) {
                    throw new Error('You have already joined another team.');
                }

                transaction.set(newTeamRef, {
                    teamName: req.proposedTeam?.teamName || 'Untitled Team',
                    problemStatement: req.proposedTeam?.problemStatement || '',
                    githubLink: req.proposedTeam?.githubLink || '',
                    // The person who sent the team-up request becomes the leader;
                    // the person who accepted it joins as a member.
                    leader: {
                        uid: req.fromUid,
                        name: fromData.name,
                        year: fromData.year,
                        branch: fromData.branch,
                        contactNumber: fromData.contactNumber || '',
                        skills: fromData.skills || [],
                    },
                    members: [{
                        uid: currentUser.uid,
                        name: toData.name,
                        year: toData.year,
                        branch: toData.branch,
                        contactNumber: toData.contactNumber || '',
                        skills: toData.skills || [],
                    }],
                    createdAt: serverTimestamp(),
                });

                transaction.update(fromUserRef, { teamId: newTeamRef.id });
                transaction.update(toUserRef, { teamId: newTeamRef.id });
                transaction.update(requestRef, { status: 'accepted' });
            });

            // Best-effort cleanup of any other pending requests involving either user
            // (join requests, invites, or other team-up requests) so stale UI clears up.
            const [byIndividualFrom, byIndividualTo, byFromUid, byToUidFrom, byToUidTo, byFromUidTo] = await Promise.all([
                getDocs(query(collection(db, 'requests'), where('individualUid', '==', req.fromUid), where('status', '==', 'pending'))),
                getDocs(query(collection(db, 'requests'), where('individualUid', '==', currentUser.uid), where('status', '==', 'pending'))),
                getDocs(query(collection(db, 'requests'), where('fromUid', '==', req.fromUid), where('status', '==', 'pending'))),
                getDocs(query(collection(db, 'requests'), where('toUid', '==', req.fromUid), where('status', '==', 'pending'))),
                getDocs(query(collection(db, 'requests'), where('toUid', '==', currentUser.uid), where('status', '==', 'pending'))),
                getDocs(query(collection(db, 'requests'), where('fromUid', '==', currentUser.uid), where('status', '==', 'pending'))),
            ]);

            const seen = new Set([req.id]);
            const toCancel = [];
            [byIndividualFrom, byIndividualTo, byFromUid, byToUidFrom, byToUidTo, byFromUidTo].forEach(snap => {
                snap.docs.forEach(d => {
                    if (!seen.has(d.id)) {
                        seen.add(d.id);
                        toCancel.push(d.id);
                    }
                });
            });

            await Promise.all(
                toCancel.map(id => updateDoc(doc(db, 'requests', id), { status: 'cancelled' }))
            );

            showToast && showToast(`Team "${req.proposedTeam?.teamName}" created with ${req.fromName}!`);

        } catch (err) {
            console.error('Failed to accept team-up request:', err);
            showAlert && showAlert(err.message || 'Failed to accept request.');
        } finally {
            setActingOn(null);
        }
    };

    const rejectPeerRequest = async (id) => {
        try {
            setActingOn(id);
            await updateDoc(doc(db, 'requests', id), { status: 'rejected' });
            showToast && showToast('Team-up request rejected.');
        } catch (err) {
            console.error('Failed to reject team-up request:', err);
            showAlert && showAlert('Failed to reject request.');
        } finally {
            setActingOn(null);
        }
    };

    const cancelPeerRequest = async (id) => {
        try {
            setActingOn(id);
            await updateDoc(doc(db, 'requests', id), { status: 'cancelled' });
            showToast && showToast('Team-up request cancelled.');
        } catch (err) {
            console.error('Failed to cancel team-up request:', err);
            showAlert && showAlert('Failed to cancel request.');
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

                {/* ---- Team-Up Requests Received ---- */}
                <section>
                    <h2 className="text-2xl font-bold text-blue-900 mb-4">Team-Up Requests Received</h2>
                    {peerReceived.length === 0 ? (
                        <p className="text-slate-500">No team-up requests.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {peerReceived.map((req) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                >
                                    <p className="font-semibold text-blue-900 text-lg">{req.fromName}</p>
                                    <p className="text-sm text-slate-500 mb-1">wants to team up with you</p>
                                    <p className="font-medium text-blue-900 mt-2">{req.proposedTeam?.teamName}</p>
                                    <p className="text-sm text-slate-500 mb-2">{req.proposedTeam?.problemStatement}</p>
                                    {req.proposedTeam?.githubLink && (
                                        <a
                                            href={req.proposedTeam.githubLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-orange-600 underline break-all"
                                        >
                                            {req.proposedTeam.githubLink}
                                        </a>
                                    )}
                                    <div className="flex gap-2 mt-4">
                                        <button onClick={() => acceptPeerRequest(req)} disabled={actingOn === req.id} className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 rounded-xl font-semibold">
                                            {actingOn === req.id ? 'Creating...' : 'Accept'}
                                        </button>
                                        <button onClick={() => rejectPeerRequest(req.id)} disabled={actingOn === req.id} className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 rounded-xl font-semibold">Reject</button>
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

                {/* ---- Team-Up Requests Sent ---- */}
                <section>
                    <h2 className="text-2xl font-bold text-blue-900 mb-4">Team-Up Requests Sent</h2>
                    {peerSent.length === 0 ? (
                        <p className="text-slate-500">No team-up requests sent yet.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {peerSent.map((req) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                >
                                    <p className="font-semibold text-blue-900">{req.toName}</p>
                                    <p className="text-sm text-slate-500 mb-1">{req.proposedTeam?.teamName}</p>
                                    <p className="text-sm mt-2">Status: <span className="font-medium capitalize">{req.status}</span></p>
                                    {req.status === 'pending' && (
                                        <button onClick={() => cancelPeerRequest(req.id)} disabled={actingOn === req.id} className="mt-3 w-full bg-gray-200 hover:bg-gray-300 text-slate-700 py-2 rounded-xl font-semibold text-sm">
                                            Cancel Request
                                        </button>
                                    )}
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