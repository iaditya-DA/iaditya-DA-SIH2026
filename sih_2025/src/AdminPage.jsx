import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot, doc, deleteDoc, setDoc, getDoc, writeBatch, query, where, getDocs } from 'firebase/firestore';
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

export default function AdminPage({ setPage }) {
    const { user, isAdmin, loading: authLoading } = useAuth();
    const [tab, setTab] = useState('teams');
    const [teams, setTeams] = useState([]);
    const [users, setUsers] = useState([]);
    const [requests, setRequests] = useState([]);
    const [settings, setSettings] = useState({ registrationOpen: true, announcement: '' });
    const [announcementDraft, setAnnouncementDraft] = useState('');
    const [savingSettings, setSavingSettings] = useState(false);
    const [loading, setLoading] = useState(true);
    const [expandedTeam, setExpandedTeam] = useState(null);
    const [search, setSearch] = useState('');
    const [deletingId, setDeletingId] = useState(null);
    const [loggingOut, setLoggingOut] = useState(false);

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
                setSettings({ registrationOpen: data.registrationOpen !== false, announcement: data.announcement || '' });
                setAnnouncementDraft(data.announcement || '');
            }
        });

        return () => {
            unsubTeams();
            unsubUsers();
            unsubRequests();
            unsubSettings();
        };
    }, [authLoading, isAdmin]);

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

    const standaloneIndividuals = users.filter(u => u.registered && u.role === 'individual' && !u.teamId);
    const registeredCount = users.filter(u => u.registered).length;
    const pendingRequests = requests.filter(r => r.status === 'pending').length;

    const fullTeams = teams.filter(t => 1 + (t.members?.length || 0) >= 6).length;
    const teamsNeedingMembers = teams.length - fullTeams;

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

    const TABS = [
        { key: 'teams', label: 'Teams', count: teams.length },
        { key: 'users', label: 'All Users', count: users.length },
        { key: 'individuals', label: 'Unassigned', count: standaloneIndividuals.length },
        { key: 'requests', label: 'Requests', count: requests.length },
        { key: 'settings', label: 'Settings', count: null },
    ];

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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
                    {[
                        { label: 'Teams', value: teams.length, color: 'from-blue-500 to-blue-600' },
                        { label: 'Full Teams', value: fullTeams, color: 'from-green-500 to-green-600' },
                        { label: 'Need Members', value: teamsNeedingMembers, color: 'from-amber-500 to-amber-600' },
                        { label: 'Registered Users', value: registeredCount, color: 'from-orange-500 to-orange-600' },
                        { label: 'Unassigned', value: standaloneIndividuals.length, color: 'from-purple-500 to-purple-600' },
                        { label: 'Pending Requests', value: pendingRequests, color: 'from-emerald-500 to-emerald-600' },
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

                {(tab === 'teams' || tab === 'users') && (
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
                            onClick={tab === 'teams' ? exportTeamsCSV : exportUsersCSV}
                            className="inline-flex items-center gap-2 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors flex-shrink-0"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                            </svg>
                            Export {tab === 'teams' ? 'Teams' : 'Users'} CSV
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