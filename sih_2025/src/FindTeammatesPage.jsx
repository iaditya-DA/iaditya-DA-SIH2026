import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    collection,
    getDocs,
    addDoc,
    query,
    where,
    doc,
    onSnapshot,
    serverTimestamp
} from 'firebase/firestore';
import { auth, db } from './firebaseClient.js';

const MAX_TEAM_SIZE = 6;

export default function FindTeammatesPage({ showToast, showAlert }) {
    const [role, setRole] = useState(null); // 'leader' | 'unassigned' | 'member'
    const [myTeam, setMyTeam] = useState(null);
    const [myProfile, setMyProfile] = useState(null);

    // ---- Leader-only state ----
    const [teams, setTeams] = useState([]);
    const [myPendingTeamIds, setMyPendingTeamIds] = useState(new Set());
    const [individuals, setIndividuals] = useState([]);
    const [invitedUids, setInvitedUids] = useState(new Set());

    // ---- Unassigned-only state: "Team Up" (peer-to-peer team creation) ----
    const [peerCandidates, setPeerCandidates] = useState([]); // other unassigned individuals
    const [peerSentUids, setPeerSentUids] = useState(new Set()); // people I've already sent a team-up request to
    const [teamDraft, setTeamDraft] = useState(null); // reused team details once filled once
    const [showTeamModal, setShowTeamModal] = useState(false);
    const [pendingTarget, setPendingTarget] = useState(null); // individual we're about to send to, once modal is submitted
    const [formTeamName, setFormTeamName] = useState('');
    const [formProblemStatement, setFormProblemStatement] = useState('');
    const [formGithubLink, setFormGithubLink] = useState('');

    const [loading, setLoading] = useState(true);
    const [sendingTo, setSendingTo] = useState(null);

    useEffect(() => {
        const user = auth.currentUser;
        if (!user) { setLoading(false); return; }

        let innerUnsubs = [];
        const cleanupInner = () => {
            innerUnsubs.forEach((u) => u && u());
            innerUnsubs = [];
        };

        // ---- Profile listener ----
        const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (profileSnap) => {
            setMyProfile(profileSnap.exists() ? profileSnap.data() : null);
        });

        // ---- Leadership listener drives everything else ----
        const leaderQuery = query(collection(db, 'teams'), where('leader.uid', '==', user.uid));
        const unsubLeader = onSnapshot(leaderQuery, (leaderSnap) => {
            cleanupInner();

            if (!leaderSnap.empty) {
                // ===== LEADER =====
                const teamData = { id: leaderSnap.docs[0].id, ...leaderSnap.docs[0].data() };
                setMyTeam(teamData);
                setRole('leader');

                const individualsQuery = query(
                    collection(db, 'users'),
                    where('registered', '==', true),
                    where('role', '==', 'individual'),
                    where('teamId', '==', null)
                );
                innerUnsubs.push(onSnapshot(individualsQuery, (snap) => {
                    setIndividuals(snap.docs.map(d => ({ id: d.id, ...d.data() })));
                    setLoading(false);
                }));

                const invitesQuery = query(
                    collection(db, 'requests'),
                    where('teamId', '==', teamData.id),
                    where('initiatedBy', '==', 'leader'),
                    where('status', '==', 'pending')
                );
                innerUnsubs.push(onSnapshot(invitesQuery, (snap) => {
                    setInvitedUids(new Set(snap.docs.map(d => d.data().individualUid)));
                }));

            } else {
                // Determine unassigned vs member from the live profile doc
                getDocs(query(collection(db, 'users'), where('__name__', '==', user.uid))).then((profileSnap) => {
                    const profile = profileSnap.docs[0]?.data();

                    if (profile?.teamId) {
                        setRole('member');
                        setLoading(false);
                    } else {
                        setRole('unassigned');

                        // -- Teams with open slots (existing "join a team" flow) --
                        const teamsQuery = collection(db, 'teams');
                        innerUnsubs.push(onSnapshot(teamsQuery, (snap) => {
                            const allTeams = snap.docs.map(d => ({ id: d.id, ...d.data() }));
                            setTeams(allTeams.filter(team => team.leader?.uid !== user.uid));
                            setLoading(false);
                        }));

                        const reqQuery = query(
                            collection(db, 'requests'),
                            where('individualUid', '==', user.uid),
                            where('initiatedBy', '==', 'individual'),
                            where('status', '==', 'pending')
                        );
                        innerUnsubs.push(onSnapshot(reqQuery, (snap) => {
                            setMyPendingTeamIds(new Set(snap.docs.map(d => d.data().teamId)));
                        }));

                        // -- Other unassigned individuals ("Team Up" flow) --
                        const peerCandidatesQuery = query(
                            collection(db, 'users'),
                            where('registered', '==', true),
                            where('role', '==', 'individual'),
                            where('teamId', '==', null)
                        );
                        innerUnsubs.push(onSnapshot(peerCandidatesQuery, (snap) => {
                            setPeerCandidates(
                                snap.docs
                                    .map(d => ({ id: d.id, ...d.data() }))
                                    .filter(ind => ind.id !== user.uid)
                            );
                        }));

                        // -- Peer team-up requests I've already sent (pending) --
                        const peerSentQuery = query(
                            collection(db, 'requests'),
                            where('fromUid', '==', user.uid),
                            where('initiatedBy', '==', 'peer'),
                            where('status', '==', 'pending')
                        );
                        innerUnsubs.push(onSnapshot(peerSentQuery, (snap) => {
                            setPeerSentUids(new Set(snap.docs.map(d => d.data().toUid)));
                        }));
                    }
                });
            }
        }, (err) => {
            console.error('Failed to load data:', err);
            showAlert && showAlert('Failed to load data.');
            setLoading(false);
        });

        return () => {
            unsubProfile();
            unsubLeader();
            cleanupInner();
        };
    }, []);

    const sendJoinRequest = async (team) => {
        try {
            const user = auth.currentUser;
            if (!user) { showAlert && showAlert('Please login first'); return; }
            if (!myProfile) { showAlert && showAlert('Complete your profile first.'); return; }

            setSendingTo(team.id);

            const dupCheck = await getDocs(query(
                collection(db, 'requests'),
                where('individualUid', '==', user.uid),
                where('teamId', '==', team.id),
                where('status', '==', 'pending')
            ));
            if (!dupCheck.empty) {
                showAlert && showAlert('You already have a pending request with this team.');
                return;
            }

            await addDoc(collection(db, 'requests'), {
                individualUid: user.uid,
                individualName: myProfile.name,
                individualYear: myProfile.year,
                individualBranch: myProfile.branch,
                individualContact: myProfile.contactNumber || '',
                individualSkills: myProfile.skills || [],
                teamId: team.id,
                teamName: team.teamName,
                leaderUid: team.leader.uid,
                initiatedBy: 'individual',
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            showToast && showToast(`Request sent to ${team.teamName}!`);

        } catch (err) {
            console.error('Failed to send request:', err);
            showAlert && showAlert('Failed to send request');
        } finally {
            setSendingTo(null);
        }
    };

    const sendInvite = async (individual) => {
        try {
            const user = auth.currentUser;
            setSendingTo(individual.id);

            const dupCheck = await getDocs(query(
                collection(db, 'requests'),
                where('individualUid', '==', individual.id),
                where('teamId', '==', myTeam.id),
                where('status', '==', 'pending')
            ));
            if (!dupCheck.empty) {
                showAlert && showAlert('You already invited this person.');
                return;
            }

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

            showToast && showToast(`Invite sent to ${individual.name}!`);

        } catch (err) {
            console.error('Failed to send invite:', err);
            showAlert && showAlert('Failed to send invite');
        } finally {
            setSendingTo(null);
        }
    };

    // ---- "Team Up" (peer-to-peer) logic ----

    const actuallySendPeerRequest = async (target, draft) => {
        try {
            const user = auth.currentUser;
            if (!myProfile) { showAlert && showAlert('Complete your profile first.'); return; }

            setSendingTo(target.id);

            const dupCheck = await getDocs(query(
                collection(db, 'requests'),
                where('fromUid', '==', user.uid),
                where('toUid', '==', target.id),
                where('status', '==', 'pending')
            ));
            if (!dupCheck.empty) {
                showAlert && showAlert('You already sent a team-up request to this person.');
                return;
            }

            await addDoc(collection(db, 'requests'), {
                fromUid: user.uid,
                fromName: myProfile.name,
                toUid: target.id,
                toName: target.name,
                proposedTeam: {
                    teamName: draft.teamName,
                    problemStatement: draft.problemStatement,
                    githubLink: draft.githubLink || '',
                },
                initiatedBy: 'peer',
                status: 'pending',
                createdAt: serverTimestamp(),
            });

            showToast && showToast(`Team-up request sent to ${target.name}!`);

        } catch (err) {
            console.error('Failed to send team-up request:', err);
            showAlert && showAlert('Failed to send request');
        } finally {
            setSendingTo(null);
        }
    };

    const handleTeamUpClick = (individual) => {
        if (peerSentUids.has(individual.id) || sendingTo) return;
        setPendingTarget(individual);

        if (teamDraft) {
            // Reuse previously entered team details — no need to ask again.
            actuallySendPeerRequest(individual, teamDraft).then(() => setPendingTarget(null));
        } else {
            setFormTeamName('');
            setFormProblemStatement('');
            setFormGithubLink('');
            setShowTeamModal(true);
        }
    };

    const openEditDraftModal = () => {
        setFormTeamName(teamDraft?.teamName || '');
        setFormProblemStatement(teamDraft?.problemStatement || '');
        setFormGithubLink(teamDraft?.githubLink || '');
        setPendingTarget(null);
        setShowTeamModal(true);
    };

    const handleTeamModalSubmit = async (e) => {
        e.preventDefault();
        if (!formTeamName.trim() || !formProblemStatement.trim()) {
            showAlert && showAlert('Please fill in Team Name and Problem Statement.');
            return;
        }

        const draft = {
            teamName: formTeamName.trim(),
            problemStatement: formProblemStatement.trim(),
            githubLink: formGithubLink.trim(),
        };
        setTeamDraft(draft);
        setShowTeamModal(false);

        if (pendingTarget) {
            await actuallySendPeerRequest(pendingTarget, draft);
            setPendingTarget(null);
        } else {
            showToast && showToast('Team details saved.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (role === 'member') {
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

    if (role === 'leader') {
        const currentSize = 1 + (myTeam.members?.length || 0);
        const isFull = currentSize >= MAX_TEAM_SIZE;

        return (
            <div className="min-h-screen bg-slate-50 px-4 py-10">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-3">Invite Members</h1>
                        <p className="text-slate-600 text-lg">{myTeam.teamName} — {currentSize}/{MAX_TEAM_SIZE} members</p>
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
                                                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">{skill}</span>
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

    // ===== UNASSIGNED — show both "Find a Team" and "Team Up With Others" =====
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="max-w-6xl mx-auto space-y-16">

                {/* ---- Section 1: Join an existing team ---- */}
                <section>
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-3">Find a Team</h1>
                        <p className="text-slate-600 text-lg">Browse teams with open slots and send a join request.</p>
                    </div>

                    {teams.length === 0 ? (
                        <div className="text-center py-16">
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
                                            onClick={() => sendJoinRequest(team)}
                                            disabled={sendingTo === team.id || isFull || alreadyRequested}
                                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            {sendingTo === team.id ? 'Sending...' : isFull ? 'Team Full' : alreadyRequested ? 'Requested' : 'Send Join Request'}
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>

                <div className="border-t border-gray-200" />

                {/* ---- Section 2: Team up with another individual ---- */}
                <section>
                    <div className="text-center mb-6">
                        <h2 className="text-4xl md:text-5xl font-black text-blue-900 mb-3">Team Up With Others</h2>
                        <p className="text-slate-600 text-lg">No team yet? Send a request to another solo participant to start one together.</p>
                    </div>

                    {teamDraft && (
                        <div className="flex justify-center mb-8">
                            <button
                                onClick={openEditDraftModal}
                                className="text-sm font-semibold text-blue-900 underline underline-offset-2 hover:text-orange-600"
                            >
                                Edit team details ({teamDraft.teamName})
                            </button>
                        </div>
                    )}

                    {peerCandidates.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-slate-500 text-lg">No other solo participants available right now.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {peerCandidates.map((individual, index) => {
                                const alreadyRequested = peerSentUids.has(individual.id);
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
                                                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium">{skill}</span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-slate-400">No skills added</span>
                                            )}
                                        </div>

                                        <button
                                            onClick={() => handleTeamUpClick(individual)}
                                            disabled={sendingTo === individual.id || alreadyRequested}
                                            className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white py-3 rounded-2xl font-semibold transition-colors"
                                        >
                                            {sendingTo === individual.id ? 'Sending...' : alreadyRequested ? 'Requested' : 'Team Up'}
                                        </button>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {/* ---- Team details modal ---- */}
            <AnimatePresence>
                {showTeamModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 flex items-center justify-center px-4 z-50"
                        onClick={() => setShowTeamModal(false)}
                    >
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.98 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-xl"
                        >
                            <h3 className="text-2xl font-black text-blue-900 mb-1">Team Details</h3>
                            <p className="text-sm text-slate-500 mb-6">
                                These details will be reused every time you send a "Team Up" request — you won't need to fill this again.
                            </p>

                            <form onSubmit={handleTeamModalSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-blue-900 mb-1">Team Name</label>
                                    <input
                                        type="text"
                                        value={formTeamName}
                                        onChange={(e) => setFormTeamName(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                        placeholder="e.g. Team Rocket"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-blue-900 mb-1">Problem Statement</label>
                                    <input
                                        type="text"
                                        value={formProblemStatement}
                                        onChange={(e) => setFormProblemStatement(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                        placeholder="What are you building?"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-blue-900 mb-1">GitHub Link <span className="font-normal text-slate-400">(optional)</span></label>
                                    <input
                                        type="text"
                                        value={formGithubLink}
                                        onChange={(e) => setFormGithubLink(e.target.value)}
                                        className="w-full border border-gray-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                        placeholder="https://github.com/..."
                                    />
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowTeamModal(false)}
                                        className="flex-1 bg-gray-100 hover:bg-gray-200 text-slate-700 py-3 rounded-2xl font-semibold transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-2xl font-semibold transition-colors"
                                    >
                                        {pendingTarget ? 'Save & Send' : 'Save Details'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}