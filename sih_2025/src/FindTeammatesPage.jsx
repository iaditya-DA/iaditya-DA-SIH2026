import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
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
import { X, Phone, Mail, User, Eye, Users, Target } from 'lucide-react';

const GithubIcon = ({ className = "w-3.5 h-3.5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
);

const DiscordIcon = ({ className = "w-3.5 h-3.5" }) => (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 00-4.885-1.515.074.074 0 00-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.25.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.057 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128 10.2 10.2 0 00.372-.292.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 01.078.01c.12.098.246.198.373.292a.077.077 0 01-.006.127 12.299 12.299 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
);

const InstagramIcon = ({ className = "w-3.5 h-3.5" }) => (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
);

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
    const [selectedUserModal, setSelectedUserModal] = useState(null);
    const [selectedTeamModal, setSelectedTeamModal] = useState(null);
    const [pendingTarget, setPendingTarget] = useState(null); // individual we're about to send to, once modal is submitted
    const [formTeamName, setFormTeamName] = useState('');
    const [formProblemStatement, setFormProblemStatement] = useState('');
    const [formGithubLink, setFormGithubLink] = useState('');

    useEffect(() => {
        if (selectedUserModal || selectedTeamModal) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, [selectedUserModal, selectedTeamModal]);

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
                teamName: draft.teamName,
                proposedTeamName: draft.teamName,
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

    const userPortalJSX = typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
            {selectedUserModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] touch-none overscroll-none"
                    onClick={() => setSelectedUserModal(null)}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl w-full max-w-lg h-[80vh] max-h-[600px] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden my-auto pointer-events-auto"
                    >
                        {/* Fixed Header */}
                        <div className="p-5 md:p-6 pb-4 border-b border-slate-100 relative shrink-0 bg-white">
                            <button
                                onClick={() => setSelectedUserModal(null)}
                                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-blue-900 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                                    {selectedUserModal.name ? selectedUserModal.name.charAt(0).toUpperCase() : 'U'}
                                </div>
                                <div className="min-w-0 pr-8">
                                    <h3 className="text-xl md:text-2xl font-black text-blue-900 truncate">{selectedUserModal.name}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 rounded-full text-xs font-semibold">
                                            Solo Participant
                                        </span>
                                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                                            {selectedUserModal.year ? (selectedUserModal.year.toString().toLowerCase().includes('year') ? selectedUserModal.year : `${selectedUserModal.year} Year`) : 'Year N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content Body */}
                        <div
                            className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-5 md:p-6 space-y-4"
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                        >
                            {/* Academic / Branch Info */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Branch / Academic Info</p>
                                <p className="text-sm font-semibold text-slate-800">{selectedUserModal.branch || 'Not specified'}</p>
                            </div>

                            {/* Contact Details */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2.5">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact Information</p>
                                <div className="flex items-center gap-3 text-slate-700 text-sm">
                                    <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                                    <span className="font-medium">{selectedUserModal.contactNumber || selectedUserModal.phone || 'Contact number not provided'}</span>
                                </div>
                                {selectedUserModal.email && (
                                    <div className="flex items-center gap-3 text-slate-700 text-sm">
                                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                                        <span className="font-medium">{selectedUserModal.email}</span>
                                    </div>
                                )}
                            </div>

                            {/* Social / Portfolio Links */}
                            {(selectedUserModal.github || selectedUserModal.discord || selectedUserModal.instagram) && (
                                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Links & Socials</p>
                                    <div className="flex flex-wrap gap-2.5">
                                        {selectedUserModal.github && (
                                            <a
                                                href={selectedUserModal.github.startsWith('http') ? selectedUserModal.github : `https://${selectedUserModal.github}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-900 hover:border-blue-300 transition-colors"
                                            >
                                                <GithubIcon className="w-3.5 h-3.5" />
                                                GitHub
                                            </a>
                                        )}
                                        {selectedUserModal.discord && (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                                                <DiscordIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                {selectedUserModal.discord}
                                            </span>
                                        )}
                                        {selectedUserModal.instagram && (
                                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                                                <InstagramIcon className="w-3.5 h-3.5 text-pink-500" />
                                                {selectedUserModal.instagram}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Skills Section */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills & Expertise</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {(selectedUserModal.skills || []).length > 0 ? (
                                        selectedUserModal.skills.map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-xl text-xs font-semibold border border-orange-100">
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <span className="text-xs text-slate-400 italic">No skills added</span>
                                    )}
                                </div>
                                {selectedUserModal.otherSkills && (
                                    <p className="text-xs text-slate-600 mt-3 pt-2 border-t border-slate-200/60">
                                        <span className="font-semibold text-slate-500">Other Skills: </span>
                                        {selectedUserModal.otherSkills}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Fixed Footer Action Button */}
                        <div className="p-4 md:p-5 bg-white border-t border-slate-100 shrink-0">
                            {role === 'leader' ? (
                                <button
                                    onClick={() => {
                                        const individual = selectedUserModal;
                                        setSelectedUserModal(null);
                                        sendInvite(individual);
                                    }}
                                    disabled={sendingTo === selectedUserModal.id || invitedUids.has(selectedUserModal.id)}
                                    className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {sendingTo === selectedUserModal.id ? 'Sending...' : invitedUids.has(selectedUserModal.id) ? 'Already Invited' : `Invite ${selectedUserModal.name ? selectedUserModal.name.split(' ')[0] : 'User'}`}
                                </button>
                            ) : (
                                <button
                                    onClick={() => {
                                        const individual = selectedUserModal;
                                        setSelectedUserModal(null);
                                        handleTeamUpClick(individual);
                                    }}
                                    disabled={sendingTo === selectedUserModal.id || peerSentUids.has(selectedUserModal.id)}
                                    className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white py-3 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
                                >
                                    {sendingTo === selectedUserModal.id ? 'Sending...' : peerSentUids.has(selectedUserModal.id) ? 'Requested' : `Team Up With ${selectedUserModal.name ? selectedUserModal.name.split(' ')[0] : 'User'}`}
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );

    const teamPortalJSX = typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
            {selectedTeamModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] touch-none overscroll-none"
                    onClick={() => setSelectedTeamModal(null)}
                    onWheel={(e) => e.stopPropagation()}
                    onTouchMove={(e) => e.stopPropagation()}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        onClick={(e) => e.stopPropagation()}
                        onWheel={(e) => e.stopPropagation()}
                        onTouchMove={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl w-full max-w-lg h-[82vh] max-h-[640px] flex flex-col shadow-2xl border border-slate-100 relative overflow-hidden my-auto pointer-events-auto"
                    >
                        {/* Fixed Header */}
                        <div className="p-5 md:p-6 pb-4 border-b border-slate-100 relative shrink-0 bg-white">
                            <button
                                onClick={() => setSelectedTeamModal(null)}
                                className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 md:w-16 md:h-16 rounded-3xl bg-gradient-to-br from-orange-500 to-orange-600 text-white font-black text-2xl flex items-center justify-center shadow-md shrink-0">
                                    {selectedTeamModal.teamName ? selectedTeamModal.teamName.charAt(0).toUpperCase() : 'T'}
                                </div>
                                <div className="min-w-0 pr-8">
                                    <h3 className="text-xl md:text-2xl font-black text-blue-900 truncate">{selectedTeamModal.teamName}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200/80 rounded-full text-xs font-bold">
                                            {(1 + (selectedTeamModal.members?.length || 0))}/{MAX_TEAM_SIZE} Members
                                        </span>
                                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full text-xs font-semibold">
                                            Leader: {selectedTeamModal.leader?.name ? selectedTeamModal.leader.name.split(' ')[0] : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Scrollable Content Body */}
                        <div
                            className="flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y p-5 md:p-6 space-y-4"
                            onWheel={(e) => e.stopPropagation()}
                            onTouchMove={(e) => e.stopPropagation()}
                        >
                            {/* Problem Statement Card */}
                            <div className="bg-orange-50/50 p-4 rounded-2xl border border-orange-100 space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                    <Target className="w-4 h-4 text-orange-600 shrink-0" />
                                    <p className="text-xs font-bold text-orange-900 uppercase tracking-wider">Problem Statement</p>
                                </div>
                                <p className="text-sm text-slate-700 leading-relaxed font-medium bg-white/80 p-3 rounded-xl border border-orange-100/60 shadow-2xs">
                                    {selectedTeamModal.problemStatement || 'No problem statement set'}
                                </p>
                            </div>

                            {/* Team Leader Section */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-lg bg-blue-900 text-white flex items-center justify-center font-bold text-xs">
                                            L
                                        </div>
                                        <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Team Leader</span>
                                    </div>
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-800 rounded-md text-[11px] font-bold border border-blue-100">
                                        {selectedTeamModal.leader?.branch || 'Branch N/A'} • {selectedTeamModal.leader?.year ? (selectedTeamModal.leader.year.toString().toLowerCase().includes('year') ? selectedTeamModal.leader.year : `${selectedTeamModal.leader.year} Year`) : 'Year N/A'}
                                    </span>
                                </div>

                                <div>
                                    <h4 className="text-base font-bold text-slate-800">{selectedTeamModal.leader?.name || 'Unknown'}</h4>
                                </div>

                                {/* Leader Contacts & Socials */}
                                <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-200/60">
                                    {(selectedTeamModal.leader?.contactNumber || selectedTeamModal.leader?.phone) && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{selectedTeamModal.leader.contactNumber || selectedTeamModal.leader.phone}</span>
                                        </div>
                                    )}

                                    {selectedTeamModal.leader?.email && (
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                            <span>{selectedTeamModal.leader.email}</span>
                                        </div>
                                    )}

                                    {selectedTeamModal.leader?.githubLink && (
                                        <a
                                            href={selectedTeamModal.leader.githubLink.startsWith('http') ? selectedTeamModal.leader.githubLink : `https://${selectedTeamModal.leader.githubLink}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:text-blue-900 hover:border-blue-300 transition-colors"
                                        >
                                            <GithubIcon className="w-3.5 h-3.5" />
                                            GitHub
                                        </a>
                                    )}
                                </div>

                                {selectedTeamModal.leader?.skills && selectedTeamModal.leader.skills.length > 0 && (
                                    <div className="pt-2 border-t border-slate-200/60">
                                        <p className="text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider">Skills</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedTeamModal.leader.skills.map((skill, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-xl text-xs font-medium border border-orange-100">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Team Members Section */}
                            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-slate-500 shrink-0" />
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                        Team Members ({(selectedTeamModal.members?.filter(m => m.name)?.length || 0)})
                                    </p>
                                </div>

                                {selectedTeamModal.members && selectedTeamModal.members.filter(m => m.name).length > 0 ? (
                                    <div className="space-y-2">
                                        {selectedTeamModal.members.filter(m => m.name).map((member, idx) => (
                                            <div key={idx} className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-sm font-bold text-blue-900">{member.name}</span>
                                                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-semibold border border-slate-200/60">
                                                        {member.branch || 'Branch N/A'} • {member.year ? (member.year.toString().toLowerCase().includes('year') ? member.year : `${member.year} Year`) : 'Year N/A'}
                                                    </span>
                                                </div>

                                                {member.contactNumber && (
                                                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                                                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                                        <span>{member.contactNumber}</span>
                                                    </div>
                                                )}

                                                {member.skills && member.skills.length > 0 && (
                                                    <div className="flex flex-wrap gap-1 pt-1">
                                                        {member.skills.map((s, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-lg text-[11px] font-medium border border-orange-100/70">
                                                                {s}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-white p-3 rounded-xl border border-dashed border-slate-200 text-center">
                                        <p className="text-xs text-slate-400 italic">No additional team members joined yet</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fixed Footer Action Button */}
                        <div className="p-4 md:p-5 bg-white border-t border-slate-100 shrink-0">
                            {(() => {
                                const currentSize = 1 + (selectedTeamModal.members?.length || 0);
                                const isFull = currentSize >= MAX_TEAM_SIZE;
                                const alreadyRequested = myPendingTeamIds.has(selectedTeamModal.id);

                                return (
                                    <button
                                        onClick={() => {
                                            const team = selectedTeamModal;
                                            setSelectedTeamModal(null);
                                            sendJoinRequest(team);
                                        }}
                                        disabled={sendingTo === selectedTeamModal.id || isFull || alreadyRequested}
                                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-2xl font-bold transition-all shadow-md active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer"
                                    >
                                        {sendingTo === selectedTeamModal.id ? 'Sending...' : isFull ? 'Team Full' : alreadyRequested ? 'Already Requested' : `Send Join Request`}
                                    </button>
                                );
                            })()}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );

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
                <div className="max-w-7xl mx-auto">
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {individuals.map((individual, index) => {
                                const alreadyInvited = invitedUids.has(individual.id);
                                return (
                                    <motion.div
                                        key={individual.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-300 transition-all duration-300 p-6 flex flex-col justify-between h-full group relative overflow-hidden"
                                    >
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-start gap-3 min-w-0 mb-3">
                                                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 font-extrabold flex items-center justify-center text-lg border border-orange-100/80 shadow-xs shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300">
                                                    {individual.name ? individual.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-lg font-bold text-blue-900 group-hover:text-orange-600 transition-colors duration-300 truncate" title={individual.name}>
                                                        {individual.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                        <span className="px-2.5 py-0.5 bg-orange-50 text-orange-800 rounded-md text-[11px] font-bold border border-orange-100/80 truncate max-w-[130px]" title={individual.branch}>
                                                            {individual.branch || 'Branch N/A'}
                                                        </span>
                                                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold border border-slate-200/70">
                                                            {individual.year ? (individual.year.toString().toLowerCase().includes('year') ? individual.year : `${individual.year} Year`) : 'Year N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 my-3" />

                                            <div className="mb-6 flex-1 flex flex-col justify-start">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                                                    <div className="flex flex-wrap gap-1.5 min-h-[2.5rem]">
                                                        {(individual.skills || []).length > 0 ? (
                                                            <>
                                                                {individual.skills.slice(0, 4).map((skill, i) => (
                                                                    <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-xl text-xs font-medium border border-orange-100/70 hover:bg-orange-100 transition-colors">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                                {individual.skills.length > 4 && (
                                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium">
                                                                        +{individual.skills.length - 4}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No skills added</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2 space-y-2">
                                            <button
                                                onClick={() => sendInvite(individual)}
                                                disabled={sendingTo === individual.id || alreadyInvited}
                                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-2xl font-semibold transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer text-sm"
                                            >
                                                {sendingTo === individual.id ? 'Sending...' : alreadyInvited ? 'Invited' : 'Send Invite'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedUserModal(individual)}
                                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl font-semibold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                <User className="w-3.5 h-3.5" />
                                                View Profile
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
                {userPortalJSX}
            </div>
        );
    }

    // ===== UNASSIGNED — show both "Find a Team" and "Team Up With Others" =====
    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="max-w-7xl mx-auto space-y-16">

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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
                                        className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-300 transition-all duration-300 p-6 flex flex-col justify-between h-full group relative overflow-hidden"
                                    >
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-start justify-between gap-3 mb-3">
                                                <div className="min-w-0">
                                                    <h3 className="text-lg font-bold text-blue-900 group-hover:text-orange-600 transition-colors duration-300 truncate" title={team.teamName}>
                                                        {team.teamName}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 font-medium truncate">Leader: {team.leader?.name}</p>
                                                </div>
                                                <span className="px-2.5 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-xs font-semibold shrink-0">
                                                    {currentSize}/{MAX_TEAM_SIZE} members
                                                </span>
                                            </div>

                                            <div className="border-t border-slate-100 my-3" />

                                            <div className="mb-6 flex-1 flex flex-col justify-start">
                                                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Problem Statement</p>
                                                {team.problemStatement ? (
                                                    <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed min-h-[2.5rem]">{team.problemStatement}</p>
                                                ) : (
                                                    <p className="text-xs text-slate-400 italic min-h-[2.5rem]">No problem statement set</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2 space-y-2">
                                            <button
                                                onClick={() => sendJoinRequest(team)}
                                                disabled={sendingTo === team.id || isFull || alreadyRequested}
                                                className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-2xl font-semibold transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer text-sm"
                                            >
                                                {sendingTo === team.id ? 'Sending...' : isFull ? 'Team Full' : alreadyRequested ? 'Requested' : 'Send Join Request'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedTeamModal(team)}
                                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl font-semibold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                <Eye className="w-3.5 h-3.5" />
                                                View Details
                                            </button>
                                        </div>
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
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {peerCandidates.map((individual, index) => {
                                const alreadyRequested = peerSentUids.has(individual.id);
                                return (
                                    <motion.div
                                        key={individual.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-300 transition-all duration-300 p-6 flex flex-col justify-between h-full group relative overflow-hidden"
                                    >
                                        <div className="flex-1 flex flex-col">
                                            <div className="flex items-start gap-3 min-w-0 mb-3">
                                                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-900 font-extrabold flex items-center justify-center text-lg border border-blue-100/80 shadow-xs shrink-0 group-hover:bg-blue-900 group-hover:text-white transition-colors duration-300">
                                                    {individual.name ? individual.name.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-lg font-bold text-blue-900 group-hover:text-orange-600 transition-colors duration-300 truncate" title={individual.name}>
                                                        {individual.name}
                                                    </h3>
                                                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                                                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-900 rounded-md text-[11px] font-bold border border-blue-100/80 truncate max-w-[130px]" title={individual.branch}>
                                                            {individual.branch || 'Branch N/A'}
                                                        </span>
                                                        <span className="px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-md text-[11px] font-bold border border-slate-200/70">
                                                            {individual.year ? (individual.year.toString().toLowerCase().includes('year') ? individual.year : `${individual.year} Year`) : 'Year N/A'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border-t border-slate-100 my-3" />

                                            <div className="mb-6 flex-1 flex flex-col justify-start">
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                                                    <div className="flex flex-wrap gap-1.5 min-h-[2.5rem]">
                                                        {(individual.skills || []).length > 0 ? (
                                                            <>
                                                                {individual.skills.slice(0, 4).map((skill, i) => (
                                                                    <span key={i} className="px-2.5 py-1 bg-orange-50 text-orange-700 rounded-xl text-xs font-medium border border-orange-100/70 hover:bg-orange-100 transition-colors">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                                {individual.skills.length > 4 && (
                                                                    <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-xl text-xs font-medium">
                                                                        +{individual.skills.length - 4}
                                                                    </span>
                                                                )}
                                                            </>
                                                        ) : (
                                                            <span className="text-xs text-slate-400 italic">No skills added</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-2 space-y-2">
                                            <button
                                                onClick={() => handleTeamUpClick(individual)}
                                                disabled={sendingTo === individual.id || alreadyRequested}
                                                className="w-full bg-blue-900 hover:bg-blue-800 disabled:bg-blue-300 text-white py-3 rounded-2xl font-semibold transition-all duration-200 shadow-xs hover:shadow-md active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer text-sm"
                                            >
                                                {sendingTo === individual.id ? 'Sending...' : alreadyRequested ? 'Requested' : 'Team Up'}
                                            </button>
                                            <button
                                                onClick={() => setSelectedUserModal(individual)}
                                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl font-semibold transition-all text-xs cursor-pointer flex items-center justify-center gap-1.5"
                                            >
                                                <User className="w-3.5 h-3.5" />
                                                View Profile
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {userPortalJSX}
            {teamPortalJSX}

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
                                    <label className="block text-sm font-bold text-blue-900 mb-1">Problem Statement ID</label>
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