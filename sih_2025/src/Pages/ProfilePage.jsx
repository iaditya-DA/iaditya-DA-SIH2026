import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
    Pencil,
    Link2,
    AtSign,
    Phone,
    LogOut,
    CheckCircle2,
    Clock,
    X,
    Save
} from 'lucide-react';
import { useAuth } from '../AuthContext.jsx';
import { logout, getCurrentUserProfile } from '../firebaseClient.js';
import {
    doc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    writeBatch
} from 'firebase/firestore';
import { auth, db } from '../firebaseClient.js';

const SKILLS_LIST = ['Frontend', 'Backend', 'AI/ML', 'App Development', 'Web Development', 'UI/UX Design', 'Project Management', 'Communication', 'Presentation', 'Cloud Computing', 'Cybersecurity', 'Blockchain'];

export default function ProfilePage({ setPage, showToast, showAlert }) {
    const { user, loading: authLoading } = useAuth();
    const [profile, setProfile] = useState(null);
    const [myTeam, setMyTeam] = useState(null);
    const [isLeader, setIsLeader] = useState(false);
    const [loading, setLoading] = useState(true);

    const [editingProfile, setEditingProfile] = useState(false);
    const [profileForm, setProfileForm] = useState(null);
    const [savingProfile, setSavingProfile] = useState(false);

    const [editingTeam, setEditingTeam] = useState(false);
    const [teamForm, setTeamForm] = useState(null);
    const [savingTeam, setSavingTeam] = useState(false);

    const loadAll = async () => {
        try {
            const data = await getCurrentUserProfile();
            setProfile(data);
            setProfileForm(data);

            // Case 1: user is a team leader
            const leaderQuery = query(collection(db, 'teams'), where('leader.uid', '==', user.uid));
            const leaderSnap = await getDocs(leaderQuery);

            if (!leaderSnap.empty) {
                const teamData = { id: leaderSnap.docs[0].id, ...leaderSnap.docs[0].data() };
                setMyTeam(teamData);
                setTeamForm(teamData);
                setIsLeader(true);
            } else if (data?.teamId) {
                // Case 2: user is a joined member
                const teamSnap = await getDoc(doc(db, 'teams', data.teamId));
                if (teamSnap.exists()) {
                    const teamData = { id: teamSnap.id, ...teamSnap.data() };
                    setMyTeam(teamData);
                    setTeamForm(teamData);
                    setIsLeader(false);
                }
            }
        } catch (err) {
            console.error('Failed to load profile:', err);
            showAlert && showAlert('Failed to load profile.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            setPage && setPage('auth');
            return;
        }
        loadAll();
    }, [user, authLoading, setPage]);

    const handleLogout = async () => {
        await logout();
        showToast && showToast('Logged out successfully!');
        setPage && setPage('home');
    };

    // ---------- Profile edit ----------
    const toggleSkill = (skill) => {
        setProfileForm(prev => {
            const skills = prev.skills || [];
            const newSkills = skills.includes(skill)
                ? skills.filter(s => s !== skill)
                : [...skills, skill];
            return { ...prev, skills: newSkills };
        });
    };

    const saveProfile = async () => {
        try {
            setSavingProfile(true);
            await updateDoc(doc(db, 'users', user.uid), {
                name: profileForm.name || '',
                year: profileForm.year || '',
                branch: profileForm.branch || '',
                skills: profileForm.skills || [],
                contactNumber: profileForm.contactNumber || '',
                github: profileForm.github || '',
                discord: profileForm.discord || '',
                instagram: profileForm.instagram || '',
            });
            setProfile(profileForm);
            setEditingProfile(false);
            showToast && showToast('Profile updated!');
        } catch (err) {
            console.error('Failed to update profile:', err);
            showAlert && showAlert('Failed to update profile.');
        } finally {
            setSavingProfile(false);
        }
    };

    // ---------- Team edit (leader only) ----------
    const updateTeamMember = (index, field, value) => {
        setTeamForm(prev => {
            const members = [...(prev.members || [])];
            members[index] = { ...members[index], [field]: value };
            return { ...prev, members };
        });
    };

    const removeTeamMember = async (index) => {
        const member = (teamForm.members || [])[index];
        if (!member) return;

        const confirmed = window.confirm(`Remove ${member.name || 'this member'} from the team?`);
        if (!confirmed) return;

        const newMembers = (teamForm.members || []).filter((_, i) => i !== index);

        try {
            const batch = writeBatch(db);
            // Remove member from the team doc
            batch.update(doc(db, 'teams', myTeam.id), { members: newMembers });
            // Free up the removed member so they show up again in Find Teammates
            if (member.uid) {
                batch.update(doc(db, 'users', member.uid), { teamId: null });
            }
            await batch.commit();

            setMyTeam(prev => ({ ...prev, members: newMembers }));
            setTeamForm(prev => ({ ...prev, members: newMembers }));
            showToast && showToast(`${member.name || 'Member'} removed from team.`);
        } catch (err) {
            console.error('Failed to remove member:', err);
            showAlert && showAlert('Failed to remove member.');
        }
    };

    const saveTeam = async () => {
        try {
            setSavingTeam(true);
            await updateDoc(doc(db, 'teams', myTeam.id), {
                teamName: teamForm.teamName,
                problemStatement: teamForm.problemStatement || '',
                members: teamForm.members || [],
            });
            setMyTeam(teamForm);
            setEditingTeam(false);
            showToast && showToast('Team updated!');
        } catch (err) {
            console.error('Failed to update team:', err);
            showAlert && showAlert('Failed to update team.');
        } finally {
            setSavingTeam(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-900/60 text-sm font-medium">Loading your dashboard…</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-blue-50">
                <p className="text-slate-500 text-lg">Profile not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-blue-50 px-4 py-16">
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

                {/* ============ LEFT: PROFILE CARD ============ */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h1 className="text-4xl font-black text-orange-500 uppercase tracking-wide text-center mb-1">
                        Participant Profile
                    </h1>
                    <p className="text-blue-900 text-sm font-semibold text-center mb-5">
                        Smart India Hackathon 2026
                    </p>

                    <div className="relative bg-orange-50 rounded-3xl border-2 border-orange-400 overflow-hidden">
                        <div className="flex justify-center pt-8">
                            <div className="w-20 h-20 rounded-full border-2 border-orange-400 bg-white text-blue-900 flex items-center justify-center text-3xl font-bold">
                                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                        </div>

                        <div className="p-8 pt-4">
                            <div className="flex justify-between items-center mb-6">
                                <span
                                    className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border-2 ${profile.registered
                                        ? 'bg-green-50 text-green-700 border-green-400'
                                        : 'bg-orange-50 text-orange-700 border-orange-400'
                                        }`}
                                >
                                    {profile.registered ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                                    {profile.registered ? 'Registration Complete' : 'Registration Pending'}
                                </span>

                                {!editingProfile && (
                                    <button
                                        onClick={() => setEditingProfile(true)}
                                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 border-2 border-orange-300 px-4 py-1.5 rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
                                    >
                                        <Pencil size={14} /> Edit
                                    </button>
                                )}
                            </div>

                            {!editingProfile ? (
                                <>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 border-t border-b border-dashed border-orange-200 py-6">
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Name</p>
                                            <p className="font-semibold text-blue-900 text-lg">{profile.name || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Email</p>
                                            <p className="font-semibold text-blue-900 text-lg break-all">{profile.email || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Year</p>
                                            <p className="font-semibold text-blue-900 text-lg">{profile.year || '—'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-400 uppercase">Branch</p>
                                            <p className="font-semibold text-blue-900 text-lg">{profile.branch || '—'}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Phone size={14} className="text-orange-400 mt-3" />
                                            <div>
                                                <p className="text-xs font-semibold text-slate-400 uppercase">Contact</p>
                                                <p className="font-semibold text-blue-900 text-lg">{profile.contactNumber || '—'}</p>
                                            </div>
                                        </div>
                                        {profile.github && (
                                            <div className="flex items-center gap-2">
                                                <Link2 size={14} className="text-orange-400 mt-3" />
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase">GitHub</p>
                                                    <p className="font-semibold text-blue-900 text-lg break-all">{profile.github}</p>
                                                </div>
                                            </div>
                                        )}
                                        {profile.instagram && (
                                            <div className="flex items-center gap-2">
                                                <AtSign size={14} className="text-orange-400 mt-3" />
                                                <div>
                                                    <p className="text-xs font-semibold text-slate-400 uppercase">Instagram</p>
                                                    <p className="font-semibold text-blue-900 text-lg break-all">{profile.instagram}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="mt-6">
                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(profile.skills || []).length > 0 ? (
                                                profile.skills.map((skill, i) => (
                                                    <span key={i} className="px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-sm font-medium border border-orange-200 hover:bg-orange-100 transition-colors">
                                                        {skill}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-slate-400">No skills added</span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4 border-t border-dashed border-orange-200 pt-6">
                                    <input
                                        type="text"
                                        placeholder="Name"
                                        value={profileForm.name || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                        className="w-full border border-orange-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Year"
                                            value={profileForm.year || ''}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, year: e.target.value }))}
                                            className="border border-orange-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Branch"
                                            value={profileForm.branch || ''}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, branch: e.target.value }))}
                                            className="border border-orange-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        />
                                    </div>
                                    <input
                                        type="tel"
                                        placeholder="Contact Number"
                                        value={profileForm.contactNumber || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                                        className="w-full border border-orange-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="GitHub (optional)"
                                            value={profileForm.github || ''}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, github: e.target.value }))}
                                            className="border border-orange-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        />
                                        <input
                                            type="text"
                                            placeholder="Instagram (optional)"
                                            value={profileForm.instagram || ''}
                                            onChange={(e) => setProfileForm(prev => ({ ...prev, instagram: e.target.value }))}
                                            className="border border-orange-200 rounded-2xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        />
                                    </div>

                                    <div>
                                        <p className="text-sm font-semibold text-slate-700 mb-2">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {SKILLS_LIST.map(skill => (
                                                <button
                                                    key={skill}
                                                    type="button"
                                                    onClick={() => toggleSkill(skill)}
                                                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${(profileForm.skills || []).includes(skill)
                                                        ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white font-bold shadow-sm shadow-orange-300'
                                                        : 'bg-orange-50 border border-orange-200 text-slate-700 hover:bg-orange-100'
                                                        }`}
                                                >
                                                    {skill}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3 pt-2">
                                        <button
                                            onClick={saveProfile}
                                            disabled={savingProfile}
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:opacity-60 text-white py-3 rounded-2xl font-semibold shadow-sm"
                                        >
                                            <Save size={16} /> {savingProfile ? 'Saving...' : 'Save Changes'}
                                        </button>
                                        <button
                                            onClick={() => { setEditingProfile(false); setProfileForm(profile); }}
                                            className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-slate-700 py-3 rounded-2xl font-semibold border border-orange-200"
                                        >
                                            <X size={16} /> Cancel
                                        </button>
                                    </div>
                                </div>
                            )}

                            <button
                                onClick={handleLogout}
                                className="w-full mt-8 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-red-400 to-red-500 hover:from-red-500 hover:to-red-600 text-white py-3 rounded-2xl font-semibold uppercase tracking-wide transition-colors"
                            >
                                <LogOut size={16} /> Log Out
                            </button>
                        </div>
                    </div>
                </motion.div>

                {/* ============ RIGHT: TEAM CARD ============ */}
                {myTeam ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-black text-orange-500 uppercase tracking-wide text-center mb-1">
                            My Team
                        </h1>
                        <p className="text-blue-900 text-sm font-semibold text-center mb-5">
                            {isLeader ? 'You are the Team Leader' : 'Team Member'}
                        </p>

                        <div className="relative bg-orange-50 rounded-3xl border-2 border-orange-400 overflow-hidden">
                            <div className="p-8">
                                <div className="flex justify-end mb-4">
                                    {isLeader && !editingTeam && (
                                        <button
                                            onClick={() => setEditingTeam(true)}
                                            className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-900 border-2 border-orange-300 px-4 py-1.5 rounded-full hover:bg-orange-500 hover:text-white hover:border-orange-500 transition-colors"
                                        >
                                            <Pencil size={14} /> Edit Team
                                        </button>
                                    )}
                                </div>

                                {!editingTeam ? (
                                    <>
                                        <p className="text-xs font-semibold text-slate-400 uppercase">Team Name</p>
                                        <p className="font-semibold text-blue-900 text-xl mb-4">{myTeam.teamName}</p>

                                        {myTeam.problemStatement && (
                                            <>
                                                <p className="text-xs font-semibold text-slate-400 uppercase">Problem Statement</p>
                                                <p className="text-slate-700 mb-4">{myTeam.problemStatement}</p>
                                            </>
                                        )}

                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-1">Team Leader</p>
                                        <div className="bg-white border border-orange-200 rounded-2xl px-4 py-2 mb-4">
                                            <p className="font-semibold text-blue-900">{myTeam.leader?.name}</p>
                                            <p className="text-sm text-slate-500">{myTeam.leader?.branch} — {myTeam.leader?.year}</p>
                                        </div>

                                        <p className="text-xs font-semibold text-slate-400 uppercase mb-2">
                                            Members ({(myTeam.members || []).length})
                                        </p>
                                        <div className="space-y-2">
                                            {(myTeam.members || []).length > 0 ? (
                                                myTeam.members.map((m, i) => (
                                                    <div key={i} className="bg-white border border-orange-100 rounded-2xl px-4 py-2 hover:bg-orange-100/40 transition-colors">
                                                        <p className="font-semibold text-blue-900">{m.name}</p>
                                                        <p className="text-sm text-slate-500">{m.branch} — {m.year}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-sm text-slate-400">No members yet.</p>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            placeholder="Team Name"
                                            value={teamForm.teamName || ''}
                                            onChange={(e) => setTeamForm(prev => ({ ...prev, teamName: e.target.value }))}
                                            className="w-full border border-orange-200 rounded-2xl px-4 py-2 font-bold focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        />
                                        <textarea
                                            placeholder="Problem Statement"
                                            value={teamForm.problemStatement || ''}
                                            onChange={(e) => setTeamForm(prev => ({ ...prev, problemStatement: e.target.value }))}
                                            className="w-full border border-orange-200 rounded-2xl px-4 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                        />

                                        <p className="text-sm font-semibold text-slate-700">Members</p>
                                        {(teamForm.members || []).map((m, i) => (
                                            <div key={i} className="border border-orange-100 bg-orange-50/40 rounded-2xl p-3 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Name"
                                                        value={m.name || ''}
                                                        onChange={(e) => updateTeamMember(i, 'name', e.target.value)}
                                                        className="min-w-0 flex-1 border border-orange-200 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                    />
                                                    <button
                                                        onClick={() => removeTeamMember(i)}
                                                        className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                        title="Remove member"
                                                    >
                                                        <X size={16} />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <input
                                                        type="text"
                                                        placeholder="Year"
                                                        value={m.year || ''}
                                                        onChange={(e) => updateTeamMember(i, 'year', e.target.value)}
                                                        className="min-w-0 border border-orange-200 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="Branch"
                                                        value={m.branch || ''}
                                                        onChange={(e) => updateTeamMember(i, 'branch', e.target.value)}
                                                        className="min-w-0 border border-orange-200 rounded-2xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-300"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={saveTeam}
                                                disabled={savingTeam}
                                                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:opacity-60 text-white py-3 rounded-2xl font-semibold shadow-sm"
                                            >
                                                <Save size={16} /> {savingTeam ? 'Saving...' : 'Save Team'}
                                            </button>
                                            <button
                                                onClick={() => { setEditingTeam(false); setTeamForm(myTeam); }}
                                                className="flex-1 inline-flex items-center justify-center gap-2 bg-orange-50 hover:bg-orange-100 text-slate-700 py-3 rounded-2xl font-semibold border border-orange-200"
                                            >
                                                <X size={16} /> Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h1 className="text-4xl font-black text-orange-500 uppercase tracking-wide text-center mb-1">
                            My Team
                        </h1>
                        <p className="text-blue-900 text-sm font-semibold text-center mb-5">
                            No team yet
                        </p>
                        <div className="relative bg-orange-50 rounded-3xl border-2 border-orange-400 overflow-hidden flex items-center justify-center p-12 text-center">
                            <div>
                                <h2 className="text-xl font-bold text-blue-900 mb-2">No Team Yet</h2>
                                <p className="text-slate-500">
                                    You haven't joined or created a team yet. Check "Find Teammates" or register a team.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}