import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    doc,
    getDoc,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebaseClient.js';

const MAX_TEAM_SIZE = 6;

export default function FindTeammatesPage({ showToast, showAlert }) {
    const [teams, setTeams] = useState([]);
    const [myProfile, setMyProfile] = useState(null);
    const [myPendingTeamIds, setMyPendingTeamIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [sendingTo, setSendingTo] = useState(null);

    const loadData = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
                setLoading(false);
                return;
            }

            const profileSnap = await getDoc(doc(db, 'users', user.uid));
            const profile = profileSnap.exists() ? profileSnap.data() : null;
            setMyProfile(profile);

            if (profile?.teamId) {
                setLoading(false);
                return;
            }

            const teamsSnap = await getDocs(collection(db, 'teams'));
            const allTeams = teamsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
            setTeams(allTeams.filter(team => team.leader?.uid !== user.uid));

            const reqSnap = await getDocs(
                query(
                    collection(db, 'requests'),
                    where('fromUid', '==', user.uid),
                    where('status', '==', 'pending')
                )
            );
            setMyPendingTeamIds(new Set(reqSnap.docs.map(d => d.data().toTeamId)));

        } catch (err) {
            console.error('Failed to load teams:', err);
            showAlert && showAlert('Failed to load teams.');
        } finally {
            setLoading(false);
        }
    };

    const sendRequest = async (team) => {
        try {
            const user = auth.currentUser;
            if (!user) {
                showAlert && showAlert('Please login first');
                return;
            }
            if (!myProfile) {
                showAlert && showAlert('Complete your profile first.');
                return;
            }

            setSendingTo(team.id);

            await addDoc(collection(db, 'requests'), {
                fromUid: user.uid,
                fromName: myProfile.name,
                fromYear: myProfile.year,
                fromBranch: myProfile.branch,
                fromContactNumber: myProfile.contactNumber || '',
                fromSkills: myProfile.skills || [],
                toTeamId: team.id,
                toTeamName: team.teamName,
                toLeaderUid: team.leader.uid,
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            setMyPendingTeamIds(prev => new Set(prev).add(team.id));
            showToast && showToast(`Request sent to ${team.teamName}!`);

        } catch (err) {
            console.error('Failed to send request:', err);
            showAlert && showAlert('Failed to send request');
        } finally {
            setSendingTo(null);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (myProfile?.teamId) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-black text-blue-900 mb-3">You're Already in a Team</h1>
                    <p className="text-slate-600">
                        You've already joined a team, so you don't need to find teammates anymore. Check your profile for team details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-3">Find a Team</h1>
                    <p className="text-slate-600 text-lg">Browse teams with open slots and send a join request.</p>
                </div>

                {teams.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">No teams available right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {teams.map((team, index) => {
                            const currentSize = 1 + (team.members?.length || 0);
                            const isFull = currentSize >= MAX_TEAM_SIZE;
                            const alreadyRequested = myPendingTeamIds.has(team.id);

                            return (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-6"
                                >
                                    <h3 className="text-xl font-bold text-blue-900 mb-1">{team.teamName}</h3>
                                    <p className="text-slate-600 mb-1">Leader: {team.leader?.name}</p>
                                    <p className="text-sm text-slate-500 mb-4">{currentSize}/{MAX_TEAM_SIZE} members</p>

                                    {team.problemStatement && (
                                        <p className="text-sm text-slate-500 mb-4 line-clamp-3">{team.problemStatement}</p>
                                    )}

                                    <button
                                        onClick={() => sendRequest(team)}
                                        disabled={sendingTo === team.id || isFull || alreadyRequested}
                                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-2xl font-semibold transition-colors"
                                    >
                                        {sendingTo === team.id
                                            ? 'Sending...'
                                            : isFull
                                                ? 'Team Full'
                                                : alreadyRequested
                                                    ? 'Requested'
                                                    : 'Send Join Request'}
                                    </button>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}