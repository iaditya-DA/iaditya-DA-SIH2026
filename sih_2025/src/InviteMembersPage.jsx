import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebaseClient.js';

const MAX_TEAM_SIZE = 6;

export default function InviteMembersPage({ showToast, showAlert, setPage }) {
    const [myTeam, setMyTeam] = useState(null);
    const [individuals, setIndividuals] = useState([]);
    const [invitedUids, setInvitedUids] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [sendingTo, setSendingTo] = useState(null);

    const loadData = async () => {
        try {
            const user = auth.currentUser;
            if (!user) { setLoading(false); return; }

            const teamQuery = query(collection(db, 'teams'), where('leader.uid', '==', user.uid));
            const teamSnap = await getDocs(teamQuery);

            if (teamSnap.empty) {
                setLoading(false);
                return;
            }

            const teamData = { id: teamSnap.docs[0].id, ...teamSnap.docs[0].data() };
            setMyTeam(teamData);

            const individualsQuery = query(
                collection(db, 'users'),
                where('registered', '==', true),
                where('role', '==', 'individual'),
                where('teamId', '==', null)
            );
            const individualsSnap = await getDocs(individualsQuery);
            setIndividuals(individualsSnap.docs.map(d => ({ id: d.id, ...d.data() })));

            const invitesQuery = query(
                collection(db, 'requests'),
                where('teamId', '==', teamData.id),
                where('initiatedBy', '==', 'leader'),
                where('status', '==', 'pending')
            );
            const invitesSnap = await getDocs(invitesQuery);
            setInvitedUids(new Set(invitesSnap.docs.map(d => d.data().individualUid)));

        } catch (err) {
            console.error('Failed to load individuals:', err);
            showAlert && showAlert('Failed to load individuals.');
        } finally {
            setLoading(false);
        }
    };

    const sendInvite = async (individual) => {
        try {
            const user = auth.currentUser;
            setSendingTo(individual.id);

            await addDoc(collection(db, 'requests'), {
                individualUid: individual.id,
                individualName: individual.name,
                individualYear: individual.year,
                individualBranch: individual.branch,
                individualContact: individual.contactNumber || '',
                individualSkills: individual.skills || [],
                teamId: myTeam.id,
                teamName: myTeam.teamName,
                leaderUid: user.uid,
                initiatedBy: 'leader',
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            setInvitedUids(prev => new Set(prev).add(individual.id));
            showToast && showToast(`Invite sent to ${individual.name}!`);

        } catch (err) {
            console.error('Failed to send invite:', err);
            showAlert && showAlert('Failed to send invite');
        } finally {
            setSendingTo(null);
        }
    };

    useEffect(() => { loadData(); }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!myTeam) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-black text-blue-900 mb-3">Only Team Leaders Can Invite</h1>
                    <p className="text-slate-600 mb-6">You need to be a team leader to invite individuals.</p>
                    <button
                        onClick={() => setPage && setPage('profile')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold"
                    >
                        Go to Profile
                    </button>
                </div>
            </div>
        );
    }

    const currentSize = 1 + (myTeam.members?.length || 0);
    const isFull = currentSize >= MAX_TEAM_SIZE;

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="max-w-6xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-3">Invite Members</h1>
                    <p className="text-slate-600 text-lg">
                        {myTeam.teamName} — {currentSize}/{MAX_TEAM_SIZE} members
                    </p>
                </div>

                {isFull ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">Your team is full. You can't invite more members.</p>
                    </div>
                ) : individuals.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-slate-500 text-lg">No individuals available to invite right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {individuals.map((individual, index) => {
                            const alreadyInvited = invitedUids.has(individual.id);

                            return (
                                <motion.div
                                    key={individual.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 p-6"
                                >
                                    <h3 className="text-xl font-bold text-blue-900 mb-1">{individual.name}</h3>
                                    <p className="text-slate-600 mb-1">{individual.branch}</p>
                                    <p className="text-sm text-slate-500 mb-4">Year {individual.year}</p>

                                    <div className="flex flex-wrap gap-2 mb-5">
                                        {(individual.skills || []).length > 0 ? (
                                            individual.skills.slice(0, 5).map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-slate-400">No skills added</span>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => sendInvite(individual)}
                                        disabled={sendingTo === individual.id || alreadyInvited}
                                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-2xl font-semibold transition-colors"
                                    >
                                        {sendingTo === individual.id ? 'Sending...' : alreadyInvited ? 'Invited' : 'Send Invite'}
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