import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    arrayUnion
} from 'firebase/firestore';
import { auth, db } from './firebaseClient.js';

const MAX_TEAM_SIZE = 6;

export default function MyRequestsPage({ showToast, showAlert }) {
    const [incoming, setIncoming] = useState([]);
    const [sent, setSent] = useState([]);
    const [myTeam, setMyTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [actingOn, setActingOn] = useState(null);

    const loadRequests = async () => {
        try {
            const currentUser = auth.currentUser;
            if (!currentUser) {
                showAlert && showAlert('Please login first');
                return;
            }
            const uid = currentUser.uid;

            const teamQuery = query(collection(db, 'teams'), where('leader.uid', '==', uid));
            const teamSnap = await getDocs(teamQuery);
            const teamDoc = teamSnap.docs[0] ? { id: teamSnap.docs[0].id, ...teamSnap.docs[0].data() } : null;
            setMyTeam(teamDoc);

            if (teamDoc) {
                const incomingQuery = query(
                    collection(db, 'requests'),
                    where('toTeamId', '==', teamDoc.id),
                    where('status', '==', 'pending')
                );
                const incomingSnap = await getDocs(incomingQuery);
                setIncoming(incomingSnap.docs.map(d => ({ id: d.id, ...d.data() })));
            } else {
                setIncoming([]);
            }

            const sentQuery = query(collection(db, 'requests'), where('fromUid', '==', uid));
            const sentSnap = await getDocs(sentQuery);
            setSent(sentSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        } catch (err) {
            console.error('Failed to load requests:', err);
            showAlert && showAlert('Failed to load requests.');
        } finally {
            setLoading(false);
        }
    };

    const acceptRequest = async (req) => {
        try {
            setActingOn(req.id);

            const teamRef = doc(db, 'teams', req.toTeamId);
            const teamSnap = await getDoc(teamRef);
            const teamData = teamSnap.data();
            const currentSize = 1 + (teamData.members?.length || 0);

            if (currentSize >= MAX_TEAM_SIZE) {
                showAlert && showAlert('Your team is already full.');
                return;
            }

            await updateDoc(teamRef, {
                members: arrayUnion({
                    uid: req.fromUid,
                    name: req.fromName,
                    year: req.fromYear,
                    branch: req.fromBranch,
                    contactNumber: req.fromContactNumber || '',
                    skills: req.fromSkills || [],
                }),
            });

            await updateDoc(doc(db, 'users', req.fromUid), {
                teamId: req.toTeamId,
            });

            await updateDoc(doc(db, 'requests', req.id), { status: 'accepted' });

            const otherReqsSnap = await getDocs(
                query(
                    collection(db, 'requests'),
                    where('fromUid', '==', req.fromUid),
                    where('status', '==', 'pending')
                )
            );
            await Promise.all(
                otherReqsSnap.docs
                    .filter(d => d.id !== req.id)
                    .map(d => updateDoc(doc(db, 'requests', d.id), { status: 'cancelled' }))
            );

            showToast && showToast(`${req.fromName} added to your team!`);
            await loadRequests();

        } catch (err) {
            console.error('Failed to accept request:', err);
            showAlert && showAlert('Failed to accept request.');
        } finally {
            setActingOn(null);
        }
    };

    const rejectRequest = async (id) => {
        try {
            setActingOn(id);
            await updateDoc(doc(db, 'requests', id), { status: 'rejected' });
            showToast && showToast('Request rejected.');
            await loadRequests();
        } catch (err) {
            console.error('Failed to reject request:', err);
            showAlert && showAlert('Failed to reject request.');
        } finally {
            setActingOn(null);
        }
    };

    useEffect(() => {
        loadRequests();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-4xl font-black text-blue-900 mb-8 text-center">My Requests</h1>

                {myTeam && (
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold text-blue-900 mb-4">
                            Incoming Requests — {myTeam.teamName} ({1 + (myTeam.members?.length || 0)}/{MAX_TEAM_SIZE})
                        </h2>
                        {incoming.length === 0 ? (
                            <p className="text-slate-500">No incoming requests.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {incoming.map((req) => (
                                    <motion.div
                                        key={req.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                    >
                                        <p className="font-semibold text-blue-900 text-lg">{req.fromName}</p>
                                        <p className="text-sm text-slate-500 mb-2">{req.fromBranch} — {req.fromYear}</p>
                                        <p className="text-sm text-slate-500 mb-3">Contact: {req.fromContactNumber || '—'}</p>

                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(req.fromSkills || []).map((skill, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => acceptRequest(req)}
                                                disabled={actingOn === req.id}
                                                className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-2 rounded-xl font-semibold"
                                            >
                                                Accept
                                            </button>
                                            <button
                                                onClick={() => rejectRequest(req.id)}
                                                disabled={actingOn === req.id}
                                                className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-red-300 text-white py-2 rounded-xl font-semibold"
                                            >
                                                Reject
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </section>
                )}

                <section>
                    <h2 className="text-2xl font-bold text-blue-900 mb-4">Sent Requests</h2>
                    {sent.length === 0 ? (
                        <p className="text-slate-500">No sent requests.</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {sent.map((req) => (
                                <motion.div
                                    key={req.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
                                >
                                    <p className="font-semibold text-blue-900">{req.toTeamName}</p>
                                    <p className="text-sm mt-2">
                                        Status: <span className="font-medium capitalize">{req.status}</span>
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}