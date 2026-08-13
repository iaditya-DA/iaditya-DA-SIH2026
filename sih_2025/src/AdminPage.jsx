import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, doc, deleteDoc, setDoc, updateDoc, getDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { db } from './firebaseClient.js';
import { useAuth } from './AuthContext.jsx';

const csvEscape = (val) => {
    const str = String(val ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

const downloadCSV = (filename, rows) => {
    const csvContent = rows.map(row => row.map(csvEscape).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

// Opens a base64 data URL (e.g. a PDF) in a new browser tab
const openFileInNewTab = (dataUrl) => {
    try {
        if (!dataUrl) {
            alert('No file data available.');
            return;
        }
        const [header, base64] = dataUrl.split(',');
        const mimeMatch = header.match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/pdf';
        const bstr = atob(base64);
        const u8arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
        const blob = new Blob([u8arr], { type: mime });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
    } catch (err) {
        console.error('Failed to open file:', err);
        alert('Failed to open file.');
    }
};

// Downloads a base64 data URL as a file with the given filename
const downloadFile = (dataUrl, filename) => {
    if (!dataUrl) {
        alert('No file data available.');
        return;
    }
    const link = document.createElement('a');
    link.href = dataUrl;
    link.setAttribute('download', filename || 'submission.pdf');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export default function AdminPage({ setPage }) {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [tab, setTab] = useState('teams');
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [settings, setSettings] = useState({ registrationOpen: true, announcement: '', votingOpen: false, votingEndsAt: null });
    const [announcementDraft, setAnnouncementDraft] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    const [resettingVotes, setResettingVotes] = useState(false);
    const [startingTimer, setStartingTimer] = useState(false);
    const [votingSecondsLeft, setVotingSecondsLeft] = useState(null);
    const [loading, setLoading] = useState(true);
    const [expandedTeam, setExpandedTeam] = useState(null);
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);

    // Judging tab state
    const [judgeScoreDrafts, setJudgeScoreDrafts] = useState({});
    const [savingScoreId, setSavingScoreId] = useState(null);
    const [togglingFinalistId, setTogglingFinalistId] = useState(null);

    useEffect(() => {
        if (authLoading) return;
        if (!isAdmin) { setLoading(false); return; }

        const unsubTeams = onSnapshot(collection(db, 'teams'), (snap) => {
            setTeams(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        const unsubUsers = onSnapshot(collection(db, 'users'), (snap) => {
            setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const unsubRequests = onSnapshot(collection(db, 'requests'), (snap) => {
            setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        const unsubSettings = onSnapshot(doc(db, 'settings', 'config'), (snap) => {
            if (snap.exists()) {
                const data = snap.data();
                setSettings({
                    registrationOpen: data.registrationOpen !== false,
                    announcement: data.announcement || '',
                    votingOpen: data.votingOpen === true,
                    votingEndsAt: data.votingEndsAt || null,
                });
                setAnnouncementDraft(data.announcement || '');
            }
        });

        const unsubSubmissions = onSnapshot(collection(db, 'aarambhSubmissions'), (snap) => {
            setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
        });

        return () => {
            unsubTeams();
            unsubUsers();
            unsubRequests();
            unsubSettings();
            unsubSubmissions();
        };
    }, [authLoading, isAdmin]);

    // Live countdown for voting timer (purely for admin's own display)
    useEffect(() => {
        if (!settings.votingOpen || !settings.votingEndsAt) {
            setVotingSecondsLeft(null);
            return;
        }
        const endsAt = new Date(settings.votingEndsAt).getTime();
        const tick = () => {
            const diff = Math.max(0, Math.round((endsAt - Date.now()) / 1000));
            setVotingSecondsLeft(diff);
            if (diff === 0) {
                // Auto-flip votingOpen to false once the timer runs out
                setDoc(doc(db, 'settings', 'config'), { votingOpen: false }, { merge: true }).catch(() => { });
            }
        };
        tick();
        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [settings.votingOpen, settings.votingEndsAt]);

    const startVoting = async (durationSeconds) => {
        try {
            setStartingTimer(true);
            const endsAt = new Date(Date.now() + durationSeconds * 1000).toISOString();
            await setDoc(doc(db, 'settings', 'config'), {
                votingOpen: true,
                votingEndsAt: endsAt,
            }, { merge: true });
        } catch (err) {
            console.error('Failed to start voting:', err);
            alert('Failed to start voting.');
        } finally {
            setStartingTimer(false);
        }
    };

    const stopVoting = async () => {
        try {
            setStartingTimer(true);
            await setDoc(doc(db, 'settings', 'config'), { votingOpen: false }, { merge: true });
        } catch (err) {
            console.error('Failed to stop voting:', err);
            alert('Failed to stop voting.');
        } finally {
            setStartingTimer(false);
        }
    };

    // Resets audience vote counts on every team AND clears voterLog so
    // the same devices/fingerprints can vote again (useful for testing).
    const resetAllVotes = async () => {
        const confirmed = window.confirm('Reset ALL audience votes? This clears vote counts on every team and lets everyone vote again.');
        if (!confirmed) return;

        try {
            setResettingVotes(true);
            const batch = writeBatch(db);

            teams.forEach(team => {
                batch.update(doc(db, 'teams', team.id), {
                    audienceTotalMarks: 0,
                    audienceVoteCount: 0,
                });
            });

            const voterLogSnap = await getDocs(collection(db, 'voterLog'));
            voterLogSnap.forEach(d => batch.delete(d.ref));

            await batch.commit();
            alert('All votes reset.');
        } catch (err) {
            console.error('Failed to reset votes:', err);
            alert('Failed to reset votes.');
        } finally {
            setResettingVotes(false);
        }
    };

    const toggleRegistration = async () => {
        try {
            await setDoc(doc(db, 'settings', 'config'), {
                registrationOpen: !settings.registrationOpen,
                announcement: settings.announcement,
            }, { merge: true });
        } catch (err) {
            console.error('Failed to toggle registration:', err);
            alert('Failed to update setting.');
        }
    };

    const saveAnnouncement = async () => {
        try {
            setSavingSettings(true);
            await setDoc(doc(db, 'settings', 'config'), {
                registrationOpen: settings.registrationOpen,
                announcement: announcementDraft,
            }, { merge: true });
        } catch (err) {
            console.error('Failed to save announcement:', err);
            alert('Failed to save announcement.');
        } finally {
            setSavingSettings(false);
        }
    };

    const deleteTeam = async (team) => {
        const confirmed = window.confirm(`Delete team "${team.teamName}"? This will remove the team and free up the leader and all members to register again.`);
        if (!confirmed) return;

        try {
            setDeletingId(team.id);
            const batch = writeBatch(db);

            batch.delete(doc(db, 'teams', team.id));

            if (team.leader?.uid) {
                batch.update(doc(db, 'users', team.leader.uid), { teamId: null, registered: false });
            }
            (team.members || []).forEach(m => {
                if (m.uid) {
                    batch.update(doc(db, 'users', m.uid), { teamId: null, registered: false });
                }
            });

            await batch.commit();
        } catch (err) {
            console.error('Failed to delete team:', err);
            alert('Failed to delete team.');
        } finally {
            setDeletingId(null);
        }
    };

    const deleteUserRecord = async (u) => {
        const confirmed = window.confirm(`Delete profile data for "${u.name || u.email}"? This removes their Firestore profile only — their login account stays active.`);
        if (!confirmed) return;

        try {
            setDeletingId(u.id);
            await deleteDoc(doc(db, 'users', u.id));
        } catch (err) {
            console.error('Failed to delete user:', err);
            alert('Failed to delete user.');
        } finally {
            setDeletingId(null);
        }
    };

    // Toggle whether a team is a "finalist" — finalist teams show up on the
    // audience VotingPage and the smart-board LiveScorePage.
    const toggleFinalist = async (team) => {
        try {
            setTogglingFinalistId(team.id);
            await updateDoc(doc(db, 'teams', team.id), {
                finalistTeam: !team.finalistTeam,
            });
        } catch (err) {
            console.error('Failed to toggle finalist status:', err);
            alert('Failed to update finalist status.');
        } finally {
            setTogglingFinalistId(null);
        }
    };

    // Save a judge's score (out of 50) for a team.
    const saveJudgeScore = async (teamId) => {
        const raw = judgeScoreDrafts[teamId];
        const value = Number(raw);

        if (raw === undefined || raw === '' || isNaN(value) || value < 0 || value > 50) {
            alert('Enter a valid score between 0 and 50.');
            return;
        }

        try {
            setSavingScoreId(teamId);
            await updateDoc(doc(db, 'teams', teamId), { judgeScore: value });
        } catch (err) {
            console.error('Failed to save judge score:', err);
            alert('Failed to save judge score.');
        } finally {
            setSavingScoreId(null);
        }
    };

    const handleLogout = async () => {
        const confirmed = window.confirm('Are you sure you want to log out?');
        if (!confirmed) return;

        try {
            setLoggingOut(true);
            await signOut(getAuth());
            setPage('home');
        } catch (err) {
            console.error('Failed to log out:', err);
            alert('Failed to log out. Please try again.');
        } finally {
            setLoggingOut(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex flex-col items-center justify-center gap-3">
                <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-blue-900/50 text-sm font-medium">Loading admin data…</p>
            </div>
        );
    }

    if (!user || !isAdmin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center px-4 py-16">
                <div className="text-center max-w-md bg-white border-2 border-red-200 rounded-3xl p-10 shadow-sm">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-black text-red-600 mb-2">Access Denied</h1>
                    <p className="text-slate-500">You don't have permission to view this page.</p>
                </div>
            </div>
        );
    }

    const filteredUsers = users.filter(u =>
        (u.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredTeams = teams.filter(t =>
        (t.teamName || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.leader?.name || '').toLowerCase().includes(search.toLowerCase())
    );

    const filteredSubmissions = submissions.filter(s => {
        const label = s.isIndividual ? (s.individualName || '') : (s.teamName || '');
        return label.toLowerCase().includes(search.toLowerCase());
    });

    // Cross-references a submission with its team/user record to get contact info.
    // Handles both team submissions (keyed by teamId) and solo individual
    // submissions (isIndividual: true, keyed by the submitter's uid).
    const getSubmissionContact = (sub) => {
        if (sub.isIndividual) {
            const submitterUser = users.find(u => u.id === (sub.submittedBy || sub.individualUid));
            return {
                displayName: sub.individualName || submitterUser?.name || '—',
                leaderName: submitterUser?.name || sub.individualName || '—',
                phone: submitterUser?.contactNumber || '—',
                email: submitterUser?.email || sub.individualName || '—',
            };
        }
        const team = teams.find(t => t.id === sub.teamId);
        const submitterUser = users.find(u => u.id === sub.submittedBy);
        return {
            displayName: sub.teamName || team?.teamName || '—',
            leaderName: team?.leader?.name || submitterUser?.name || '—',
            phone: team?.leader?.contactNumber || submitterUser?.contactNumber || '—',
            email: submitterUser?.email || team?.leader?.email || '—',
        };
    };

    const formatSubmittedAt = (ts) => {
        if (!ts) return '—';
        if (ts.toDate) return ts.toDate().toLocaleString();
        return String(ts);
    };

    const standaloneIndividuals = users.filter(u => u.registered && u.role === 'individual' && !u.teamId);
    const registeredCount = users.filter(u => u.registered).length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;

    const fullTeams = teams.filter(t => 1 + (t.members?.length || 0) >= 6).length;
    const teamsNeedingMembers = teams.length - fullTeams;
    const individualSubmissionsCount = submissions.filter(s => s.isIndividual).length;
    const finalistCount = teams.filter(t => t.finalistTeam).length;

    const statusStyles = {
        accepted: 'bg-green-50 text-green-700 border-green-200',
        rejected: 'bg-red-50 text-red-700 border-red-200',
        cancelled: 'bg-gray-100 text-gray-500 border-gray-200',
        pending: 'bg-orange-50 text-orange-700 border-orange-200',
    };

    const exportTeamsCSV = () => {
        const rows = [
            ['Team Name', 'Problem Statement', 'Leader Name', 'Leader Branch', 'Leader Year', 'Leader Contact', 'Leader GitHub', 'Team Size', 'Member Name', 'Member Branch', 'Member Year', 'Member Contact'],
        ];
        teams.forEach(team => {
            const base = [
                team.teamName || '',
                team.problemStatement || '',
                team.leader?.name || '',
                team.leader?.branch || '',
                team.leader?.year || '',
                team.leader?.contactNumber || '',
                team.leader?.githubLink || '',
                1 + (team.members?.length || 0),
            ];
            if ((team.members || []).length === 0) {
                rows.push([...base, '', '', '', '']);
            } else {
                team.members.forEach(m => {
                    rows.push([...base, m.name || '', m.branch || '', m.year || '', m.contactNumber || '']);
                });
            }
        });
        downloadCSV('teams.csv', rows);
    };

    const exportUsersCSV = () => {
        const rows = [
            ['Name', 'Email', 'Branch', 'Year', 'Contact', 'Role', 'Registered', 'Skills', 'Team ID'],
            ...users.map(u => [
                u.name || '',
                u.email || '',
                u.branch || '',
                u.year || '',
                u.contactNumber || '',
                u.role || '',
                u.registered ? 'Yes' : 'No',
                (u.skills || []).join('; '),
                u.teamId || '',
            ]),
        ];
        downloadCSV('users.csv', rows);
    };

    const exportSubmissionsCSV = () => {
        const rows = [
            ['Type', 'Team / Individual Name', 'Track', 'Contact Name', 'Phone', 'Email', 'File Name', 'Submitted At'],
            ...submissions.map(s => {
                const { displayName, leaderName, phone, email } = getSubmissionContact(s);
                return [
                    s.isIndividual ? 'Individual' : 'Team',
                    displayName,
                    s.track || '',
                    leaderName,
                    phone,
                    email,
                    s.pptFileName || '',
                    formatSubmittedAt(s.submittedAt),
                ];
            }),
        ];
        downloadCSV('submissions.csv', rows);
    };

    const TABS = [
        { key: 'teams', label: 'Teams', count: teams.length },
        { key: 'judging', label: 'Judging', count: finalistCount },
        { key: 'users', label: 'All Users', count: users.length },
        { key: 'individuals', label: 'Unassigned', count: standaloneIndividuals.length },
        { key: 'requests', label: 'Requests', count: requests.length },
        { key: 'submissions', label: 'Submissions', count: submissions.length },
        { key: 'settings', label: 'Settings', count: null },
    ];

    const exportHandlers = {
        teams: exportTeamsCSV,
        users: exportUsersCSV,
        submissions: exportSubmissionsCSV,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 px-4 py-10">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
                    <div>
                        <span className="inline-block text-xs font-bold tracking-widest text-orange-500 uppercase mb-1">Control Center</span>
                        <h1 className="text-4xl font-black text-blue-900">Admin Panel</h1>
                    </div>

                    <motion.button
                        onClick={handleLogout}
                        disabled={loggingOut}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 bg-white border-2 border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors disabled:opacity-60 shadow-sm"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        {loggingOut ? 'Logging out…' : 'Logout'}
                    </motion.button>
                </div>

                {/* Stat cards */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4 mb-8">
                    {[
                        { label: 'Teams', value: teams.length, color: 'from-blue-500 to-blue-600' },
                        { label: 'Full Teams', value: fullTeams, color: 'from-green-500 to-green-600' },
                        { label: 'Need Members', value: teamsNeedingMembers, color: 'from-amber-500 to-amber-600' },
                        { label: 'Registered Users', value: registeredCount, color: 'from-orange-500 to-orange-600' },
                        { label: 'Unassigned', value: standaloneIndividuals.length, color: 'from-purple-500 to-purple-600' },
                        { label: 'Pending Requests', value: pendingRequests, color: 'from-emerald-500 to-emerald-600' },
                        { label: 'Finalists', value: finalistCount, color: 'from-orange-500 to-red-500' },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.04 }}
                            className="relative overflow-hidden bg-white rounded-2xl border border-gray-200 p-5 shadow-sm"
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${stat.color}`} />
                            <p className="text-3xl font-black text-blue-900">{stat.value}</p>
                            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mt-1">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Registration status banner */}
                <div className={`flex items-center justify-between gap-4 mb-6 p-4 rounded-2xl border-2 ${settings.registrationOpen ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full ${settings.registrationOpen ? 'bg-green-500' : 'bg-red-500'}`} />
                        <p className={`text-sm font-bold ${settings.registrationOpen ? 'text-green-700' : 'text-red-700'}`}>
                            Registration is currently {settings.registrationOpen ? 'OPEN' : 'CLOSED'}
                        </p>
                    </div>
                    <button
                        onClick={toggleRegistration}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide transition-colors ${settings.registrationOpen
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-green-500 hover:bg-green-600 text-white'
                            }`}
                    >
                        {settings.registrationOpen ? 'Close Registration' : 'Open Registration'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 flex-wrap bg-white p-1.5 rounded-2xl border border-gray-200 shadow-sm w-fit">
                    {TABS.map(t => (
                        <button
                            key={t.key}
                            onClick={() => setTab(t.key)}
                            className={`px-4 py-2 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${tab === t.key
                                ? 'bg-blue-900 text-white shadow-sm'
                                : 'text-slate-500 hover:bg-gray-50'
                                }`}
                        >
                            {t.label}
                            {t.count !== null && (
                                <span className={`px-1.5 py-0.5 rounded-full text-xs ${tab === t.key ? 'bg-white/20' : 'bg-gray-100'}`}>
                                    {t.count}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {(tab === 'teams' || tab === 'users' || tab === 'submissions') && (
                    <div className="flex flex-col sm:flex-row gap-3 mb-6 items-start sm:items-center">
                        <div className="relative max-w-md w-full">
                            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-orange-300"
                            />
                        </div>

                        <button
                            onClick={exportHandlers[tab]}
                            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            Export {tab === 'teams' ? 'Teams' : tab === 'users' ? 'Users' : 'Submissions'} CSV
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {/* ===== TEAMS TAB ===== */}
                    {tab === 'teams' && (
                        <motion.div key="teams" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {filteredTeams.length === 0 ? (
                                <p className="text-slate-400 text-center py-16">No teams found.</p>
                            ) : (
                                filteredTeams.map(team => {
                                    const isOpen = expandedTeam === team.id;
                                    const size = 1 + (team.members?.length || 0);
                                    const isFull = size >= 6;
                                    return (
                                        <div key={team.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                            <div className="w-full flex justify-between items-center p-5">
                                                <button
                                                    onClick={() => setExpandedTeam(isOpen ? null : team.id)}
                                                    className="flex items-center gap-4 text-left flex-1 hover:opacity-80 transition-opacity"
                                                >
                                                    <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                                                        {team.teamName?.charAt(0)?.toUpperCase() || 'T'}
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-blue-900 text-lg">{team.teamName}</p>
                                                        <p className="text-sm text-slate-500">Leader: {team.leader?.name}</p>
                                                    </div>
                                                </button>
                                                <div className="flex items-center gap-3">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${isFull ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                                        {size}/6
                                                    </span>
                                                    <button
                                                        onClick={() => deleteTeam(team)}
                                                        disabled={deletingId === team.id}
                                                        className="w-8 h-8 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors disabled:opacity-50"
                                                        title="Delete team"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                    <button onClick={() => setExpandedTeam(isOpen ? null : team.id)} className="text-slate-400">
                                                        <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="inline-block">▼</motion.span>
                                                    </button>
                                                </div>
                                            </div>

                                            <AnimatePresence>
                                                {isOpen && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="border-t border-gray-100 p-5 space-y-4 bg-slate-50/50">
                                                            {team.problemStatement && (
                                                                <div>
                                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Problem Statement</p>
                                                                    <p className="text-slate-700 text-sm">{team.problemStatement}</p>
                                                                </div>
                                                            )}

                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Leader</p>
                                                                <div className="bg-white border border-gray-200 rounded-xl p-3 text-sm">
                                                                    <p className="font-semibold text-blue-900">{team.leader?.name}</p>
                                                                    <p className="text-slate-500">{team.leader?.branch} — {team.leader?.year}</p>
                                                                    <p className="text-slate-500">Contact: {team.leader?.contactNumber}</p>
                                                                    {team.leader?.githubLink && <p className="text-slate-500">GitHub: {team.leader.githubLink}</p>}
                                                                    <p className="text-slate-400 text-xs mt-1 font-mono">{team.leader?.uid}</p>
                                                                </div>
                                                            </div>

                                                            <div>
                                                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Members ({(team.members || []).length})</p>
                                                                {(team.members || []).length === 0 ? (
                                                                    <p className="text-sm text-slate-400">No members yet.</p>
                                                                ) : (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                                        {team.members.map((m, i) => (
                                                                            <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 text-sm">
                                                                                <p className="font-semibold text-blue-900">{m.name}</p>
                                                                                <p className="text-slate-500">{m.branch} — {m.year}</p>
                                                                                <p className="text-slate-500">Contact: {m.contactNumber || '—'}</p>
                                                                                {m.uid && <p className="text-slate-400 text-xs mt-1 font-mono">{m.uid}</p>}
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}



                    {/* ===== JUDGING TAB ===== */}
                    {tab === 'judging' && (
                        <motion.div key="judging" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-4 mb-2">
                                <p className="text-sm font-semibold text-orange-700">
                                    Mark teams as finalists to send them to the audience Voting page and the smart-board Live Leaderboard, then enter each team's judge score (out of 50).
                                </p>
                            </div>

                            {/* Voting control panel */}
                            <div className="bg-white rounded-2xl border-2 border-blue-100 p-5 mb-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className={`w-2.5 h-2.5 rounded-full ${settings.votingOpen && votingSecondsLeft > 0 ? 'bg-green-500' : 'bg-red-500'}`} />
                                    <div>
                                        <p className="text-sm font-bold text-blue-900">
                                            Audience Voting: {settings.votingOpen && votingSecondsLeft > 0 ? 'OPEN' : 'CLOSED'}
                                        </p>
                                        {settings.votingOpen && votingSecondsLeft > 0 && (
                                            <p className="text-xs text-orange-600 font-semibold">
                                                Closes in {Math.floor(votingSecondsLeft / 60)}:{String(votingSecondsLeft % 60).padStart(2, '0')}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                    <button
                                        onClick={() => startVoting(60)}
                                        disabled={startingTimer}
                                        className="px-4 py-2 rounded-xl bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-500 hover:text-white text-xs font-bold uppercase tracking-wide disabled:opacity-60"
                                    >
                                        Start (1 min)
                                    </button>
                                    <button
                                        onClick={() => startVoting(90)}
                                        disabled={startingTimer}
                                        className="px-4 py-2 rounded-xl bg-green-50 text-green-700 border-2 border-green-200 hover:bg-green-500 hover:text-white text-xs font-bold uppercase tracking-wide disabled:opacity-60"
                                    >
                                        Start (1.5 min)
                                    </button>
                                    <button
                                        onClick={stopVoting}
                                        disabled={startingTimer}
                                        className="px-4 py-2 rounded-xl bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-500 hover:text-white text-xs font-bold uppercase tracking-wide disabled:opacity-60"
                                    >
                                        Stop Voting
                                    </button>
                                    <button
                                        onClick={resetAllVotes}
                                        disabled={resettingVotes}
                                        className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 border-2 border-slate-200 hover:bg-slate-500 hover:text-white text-xs font-bold uppercase tracking-wide disabled:opacity-60"
                                    >
                                        {resettingVotes ? 'Resetting…' : 'Reset All Votes'}
                                    </button>
                                </div>
                            </div>

                            {teams.length === 0 ? (
                                <p className="text-slate-400 text-center py-16">No teams found.</p>
                            ) : (
                                teams.map(team => {
                                    const draft = judgeScoreDrafts[team.id] ?? (team.judgeScore ?? '');
                                    const audienceAvg = team.audienceVoteCount
                                        ? (team.audienceTotalMarks || 0) / team.audienceVoteCount
                                        : 0;

                                    return (
                                        <div
                                            key={team.id}
                                            className={`bg-white rounded-2xl border-2 shadow-sm p-5 flex flex-col md:flex-row md:items-center gap-4 justify-between transition-colors ${team.finalistTeam ? 'border-orange-300' : 'border-gray-200'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                                <div className="w-11 h-11 rounded-xl bg-blue-900 text-white flex items-center justify-center font-bold flex-shrink-0">
                                                    {team.teamName?.charAt(0)?.toUpperCase() || 'T'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-bold text-blue-900 text-lg truncate">{team.teamName}</p>
                                                    <p className="text-sm text-slate-500">
                                                        Judge: <span className="font-semibold text-orange-600">{team.judgeScore ?? '—'}</span>/50
                                                        {team.finalistTeam && team.audienceVoteCount > 0 && (
                                                            <span className="ml-2">
                                                                · Audience avg: <span className="font-semibold text-blue-700">{audienceAvg.toFixed(1)}</span>/50 ({team.audienceVoteCount} votes)
                                                            </span>
                                                        )}
                                                        {team.finalistTeam && (
                                                            <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 border border-orange-300 align-middle">
                                                                Finalist
                                                            </span>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 flex-wrap">
                                                <button
                                                    onClick={() => toggleFinalist(team)}
                                                    disabled={togglingFinalistId === team.id}
                                                    className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wide transition-colors disabled:opacity-60 ${team.finalistTeam
                                                        ? 'bg-red-50 text-red-600 border-2 border-red-200 hover:bg-red-500 hover:text-white'
                                                        : 'bg-green-50 text-green-600 border-2 border-green-200 hover:bg-green-500 hover:text-white'
                                                        }`}
                                                >
                                                    {togglingFinalistId === team.id
                                                        ? 'Updating…'
                                                        : team.finalistTeam
                                                            ? 'Remove Finalist'
                                                            : 'Mark Finalist'}
                                                </button>

                                                <input
                                                    type="number"
                                                    min={0}
                                                    max={50}
                                                    placeholder="0-50"
                                                    value={draft}
                                                    onChange={(e) => setJudgeScoreDrafts(prev => ({ ...prev, [team.id]: e.target.value }))}
                                                    className="w-24 border border-gray-300 rounded-xl px-3 py-2 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                />

                                                <button
                                                    onClick={() => saveJudgeScore(team.id)}
                                                    disabled={savingScoreId === team.id}
                                                    className="px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white text-xs font-bold uppercase tracking-wide"
                                                >
                                                    {savingScoreId === team.id ? 'Saving…' : 'Save Score'}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </motion.div>
                    )}

                    {/* ===== ALL USERS TAB ===== */}
                    {tab === 'users' && (
                        <motion.div key="users" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-blue-900 text-white">
                                        <tr>
                                            <th className="text-left p-3.5 font-semibold">Name</th>
                                            <th className="text-left p-3.5 font-semibold">Email</th>
                                            <th className="text-left p-3.5 font-semibold">Branch / Year</th>
                                            <th className="text-left p-3.5 font-semibold">Contact</th>
                                            <th className="text-left p-3.5 font-semibold">Role</th>
                                            <th className="text-left p-3.5 font-semibold">Registered</th>
                                            <th className="text-left p-3.5 font-semibold">Team</th>
                                            <th className="text-left p-3.5 font-semibold">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredUsers.length === 0 ? (
                                            <tr><td colSpan={8} className="text-center text-slate-400 py-10">No users found.</td></tr>
                                        ) : filteredUsers.map((u, i) => (
                                            <tr key={u.id} className={`border-b border-gray-100 hover:bg-orange-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                <td className="p-3.5 font-semibold text-blue-900">{u.name || '—'}</td>
                                                <td className="p-3.5 text-slate-600">{u.email || '—'}</td>
                                                <td className="p-3.5 text-slate-600">{u.branch || '—'} / {u.year || '—'}</td>
                                                <td className="p-3.5 text-slate-600">{u.contactNumber || '—'}</td>
                                                <td className="p-3.5 text-slate-600 capitalize">{u.role || '—'}</td>
                                                <td className="p-3.5">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${u.registered ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                        {u.registered ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="p-3.5 text-slate-400 text-xs font-mono">{u.teamId || '—'}</td>
                                                <td className="p-3.5">
                                                    <button
                                                        onClick={() => deleteUserRecord(u)}
                                                        disabled={deletingId === u.id}
                                                        className="text-red-500 hover:text-red-700 text-xs font-semibold disabled:opacity-50"
                                                    >
                                                        Delete
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== UNASSIGNED INDIVIDUALS TAB ===== */}
                    {tab === 'individuals' && (
                        <motion.div key="individuals" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {standaloneIndividuals.length === 0 ? (
                                <p className="text-slate-400 text-center py-16 col-span-full">No unassigned individuals.</p>
                            ) : (
                                standaloneIndividuals.map(ind => (
                                    <div key={ind.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold flex-shrink-0">
                                                {ind.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                            <div>
                                                <p className="font-bold text-blue-900">{ind.name}</p>
                                                <p className="text-xs text-slate-500">{ind.branch} — {ind.year}</p>
                                            </div>
                                        </div>
                                        <p className="text-sm text-slate-500 mb-3">Contact: {ind.contactNumber || '—'}</p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {(ind.skills || []).map((s, i) => (
                                                <span key={i} className="px-2 py-0.5 bg-orange-50 text-orange-700 rounded-full text-xs font-medium border border-orange-200">{s}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </motion.div>
                    )}

                    {/* ===== REQUESTS TAB ===== */}
                    {tab === 'requests' && (
                        <motion.div key="requests" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-blue-900 text-white">
                                        <tr>
                                            <th className="text-left p-3.5 font-semibold">Individual</th>
                                            <th className="text-left p-3.5 font-semibold">Team</th>
                                            <th className="text-left p-3.5 font-semibold">Direction</th>
                                            <th className="text-left p-3.5 font-semibold">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {requests.length === 0 ? (
                                            <tr><td colSpan={4} className="text-center text-slate-400 py-10">No requests yet.</td></tr>
                                        ) : requests.map((r, i) => {
                                            const isPeer = r.type === 'peer_teamup' || r.initiatedBy === 'peer';
                                            const isLeader = r.initiatedBy === 'leader';
                                            const indName = r.individualName || r.fromName || '—';
                                            const tName = r.proposedTeam?.teamName || r.proposedTeamName || r.teamName || '—';
                                            const directionLabel = isPeer
                                                ? `🤝 Peer → ${r.toName || 'Peer'}`
                                                : isLeader
                                                    ? '📤 Leader → Individual'
                                                    : '📥 Individual → Team';

                                            return (
                                                <tr key={r.id} className={`border-b border-gray-100 hover:bg-orange-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                    <td className="p-3.5 text-blue-900 font-semibold">{indName}</td>
                                                    <td className="p-3.5 text-slate-700 font-medium">{tName}</td>
                                                    <td className="p-3.5 text-slate-500 text-xs font-medium">
                                                        {directionLabel}
                                                    </td>
                                                    <td className="p-3.5">
                                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize border ${statusStyles[r.status] || statusStyles.pending}`}>
                                                            {r.status}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== SUBMISSIONS TAB ===== */}
                    {tab === 'submissions' && (
                        <motion.div key="submissions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                    {submissions.length - individualSubmissionsCount} Team Submissions
                                </span>
                                <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                                    {individualSubmissionsCount} Individual Submissions
                                </span>
                            </div>
                            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-blue-900 text-white">
                                            <tr>
                                                <th className="text-left p-3.5 font-semibold">Type</th>
                                                <th className="text-left p-3.5 font-semibold">Team / Individual</th>
                                                <th className="text-left p-3.5 font-semibold">Track</th>
                                                <th className="text-left p-3.5 font-semibold">Contact Name</th>
                                                <th className="text-left p-3.5 font-semibold">Phone</th>
                                                <th className="text-left p-3.5 font-semibold">Email</th>
                                                <th className="text-left p-3.5 font-semibold">File</th>
                                                <th className="text-left p-3.5 font-semibold">Submitted At</th>
                                                <th className="text-left p-3.5 font-semibold">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {filteredSubmissions.length === 0 ? (
                                                <tr><td colSpan={9} className="text-center text-slate-400 py-10">No submissions found.</td></tr>
                                            ) : filteredSubmissions.map((s, i) => {
                                                const { displayName, leaderName, phone, email } = getSubmissionContact(s);
                                                return (
                                                    <tr key={s.id} className={`border-b border-gray-100 hover:bg-orange-50/40 transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}`}>
                                                        <td className="p-3.5">
                                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${s.isIndividual ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                                                {s.isIndividual ? 'Individual' : 'Team'}
                                                            </span>
                                                        </td>
                                                        <td className="p-3.5 font-semibold text-blue-900">{displayName}</td>
                                                        <td className="p-3.5 text-slate-600">{s.track || '—'}</td>
                                                        <td className="p-3.5 text-slate-600">{leaderName}</td>
                                                        <td className="p-3.5 text-slate-600">{phone}</td>
                                                        <td className="p-3.5 text-slate-600">{email}</td>
                                                        <td className="p-3.5 text-slate-600">{s.pptFileName || '—'}</td>
                                                        <td className="p-3.5 text-slate-500 text-xs">{formatSubmittedAt(s.submittedAt)}</td>
                                                        <td className="p-3.5">
                                                            <div className="flex gap-2">
                                                                <button
                                                                    onClick={() => openFileInNewTab(s.pptBase64)}
                                                                    className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-500 hover:text-white transition-colors text-xs font-semibold"
                                                                >
                                                                    Open
                                                                </button>
                                                                <button
                                                                    onClick={() => downloadFile(s.pptBase64, s.pptFileName)}
                                                                    className="px-3 py-1.5 rounded-lg bg-green-50 text-green-700 border border-green-200 hover:bg-green-500 hover:text-white transition-colors text-xs font-semibold"
                                                                >
                                                                    Download
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ===== SETTINGS TAB ===== */}
                    {tab === 'settings' && (
                        <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-2xl bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Site Announcement</p>
                                <p className="text-sm text-slate-500 mb-3">Shown at the top of the site for everyone. Leave empty to hide.</p>
                                <textarea
                                    value={announcementDraft}
                                    onChange={(e) => setAnnouncementDraft(e.target.value)}
                                    placeholder="e.g. Round 1 results announced! Check the Results page."
                                    className="w-full border border-gray-300 rounded-xl px-4 py-3 h-28 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                />
                                <button
                                    onClick={saveAnnouncement}
                                    disabled={savingSettings}
                                    className="mt-3 bg-blue-900 hover:bg-blue-800 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl font-semibold text-sm"
                                >
                                    {savingSettings ? 'Saving...' : 'Save Announcement'}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}