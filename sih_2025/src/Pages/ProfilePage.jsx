import React, { useEffect, useState } from 'react';
import {
    Pencil,
    Link2,
    AtSign,
    Phone,
    Mail,
    LogOut,
    CheckCircle2,
    Clock,
    X,
    Save,
    UserPlus,
    Users,
    GraduationCap,
    Landmark,
    Sparkles,
    ShieldCheck,
    FileText,
    Code2,
    Server,
    Brain,
    Smartphone,
    Globe,
    PenTool,
    ClipboardList,
    MessageSquare,
    MonitorPlay,
    Cloud,
    Blocks
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

const SKILL_ICONS = {
    'Frontend': Code2,
    'Backend': Server,
    'AI/ML': Brain,
    'App Development': Smartphone,
    'Web Development': Globe,
    'UI/UX Design': PenTool,
    'Project Management': ClipboardList,
    'Communication': MessageSquare,
    'Presentation': MonitorPlay,
    'Cloud Computing': Cloud,
    'Cybersecurity': ShieldCheck,
    'Blockchain': Blocks,
};

// ---- Shared bits so both cards stay visually identical ----

function PrimaryButton({ children, className = '', ...rest }) {
    return (
        <button
            {...rest}
            className={`inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-full shadow-sm shadow-indigo-200 transition-colors ${className}`}
        >
            {children}
        </button>
    );
}

function OutlineButton({ children, className = '', ...rest }) {
    return (
        <button
            {...rest}
            className={`inline-flex items-center justify-center gap-1.5 text-sm font-semibold text-indigo-600 border border-indigo-200 bg-white px-4 py-2 rounded-full hover:bg-indigo-50 transition-colors whitespace-nowrap ${className}`}
        >
            {children}
        </button>
    );
}

function GhostInput(props) {
    return (
        <input
            {...props}
            className={`w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 ${props.className || ''}`}
        />
    );
}

function StatTile({ label, value, icon: Icon }) {
    return (
        <div className="bg-indigo-50/60 rounded-xl px-4 py-3 flex items-center gap-3">
            {Icon && (
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                    <Icon size={16} />
                </div>
            )}
            <div className="min-w-0">
                <p className="text-xs text-slate-400">{label}</p>
                <p className="text-sm font-bold text-blue-900 break-all">{value || '—'}</p>
            </div>
        </div>
    );
}

// Decorative background: soft blobs + dotted corners, purely visual
function Decor() {
    const dotStyle = {
        backgroundImage: 'radial-gradient(circle, #c7c7e8 1.4px, transparent 1.4px)',
        backgroundSize: '16px 16px',
    };
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-200 rounded-full blur-3xl opacity-30" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-40" />
            <div className="absolute top-6 left-6 w-24 h-24 opacity-60 hidden sm:block" style={dotStyle} />
            <div className="absolute bottom-6 right-6 w-24 h-24 opacity-60 hidden sm:block" style={dotStyle} />
        </div>
    );
}

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
            batch.update(doc(db, 'teams', myTeam.id), { members: newMembers });
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
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="w-10 h-10 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-blue-900/60 text-sm font-medium">Loading your dashboard…</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <p className="text-slate-500 text-lg">Profile not found.</p>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen bg-slate-50 overflow-hidden px-4 py-14">
            <Decor />

            <div className="relative max-w-5xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-3xl sm:text-4xl font-bold text-blue-900 mb-2">
                        My Profile
                    </h1>
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <div className="w-10 h-0.5 bg-indigo-300 rounded-full" />
                        <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full" />
                    </div>
                    <p className="text-slate-500 text-sm">Smart India Hackathon 2026</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ============ LEFT: PROFILE CARD ============ */}
                    <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-xl shadow-slate-200/60 p-7 flex flex-col h-full">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full border-2 border-orange-400 bg-orange-50 text-blue-900 flex items-center justify-center text-2xl font-bold shrink-0">
                                {profile.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="font-bold text-blue-900 text-lg truncate">{profile.name || 'Unnamed'}</p>
                                <span
                                    className={`inline-flex items-center gap-1 mt-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${profile.registered
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-orange-50 text-orange-600'
                                        }`}
                                >
                                    {profile.registered ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                                    {profile.registered ? 'Registered' : 'Pending'}
                                </span>
                            </div>
                            {!editingProfile && (
                                <OutlineButton onClick={() => setEditingProfile(true)}>
                                    <Pencil size={13} /> Edit Profile
                                </OutlineButton>
                            )}
                        </div>

                        {!editingProfile ? (
                            <>
                                <div className="grid grid-cols-2 gap-2.5">
                                    <StatTile label="Email" value={profile.email} icon={Mail} />
                                    <StatTile label="Year" value={profile.year} icon={GraduationCap} />
                                    <StatTile label="Branch" value={profile.branch} icon={Landmark} />
                                    <StatTile label="Contact" value={profile.contactNumber} icon={Phone} />
                                    {profile.github && <StatTile label="GitHub" value={profile.github} icon={Link2} />}
                                    {profile.instagram && <StatTile label="Instagram" value={profile.instagram} icon={AtSign} />}
                                </div>

                                <div className="mt-6">
                                    <p className="flex items-center gap-1.5 text-sm font-semibold text-blue-900 mb-2.5">
                                        <Sparkles size={14} className="text-indigo-400" /> Skills
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {(profile.skills || []).length > 0 ? (
                                            profile.skills.map((skill, i) => {
                                                const SkillIcon = SKILL_ICONS[skill];
                                                return (
                                                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-600 rounded-full text-xs font-medium">
                                                        {SkillIcon && <SkillIcon size={12} />}
                                                        {skill}
                                                    </span>
                                                );
                                            })
                                        ) : (
                                            <span className="text-sm text-slate-400">No skills added</span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex-1" />
                            </>
                        ) : (
                            <div className="space-y-3">
                                <GhostInput
                                    type="text"
                                    placeholder="Name"
                                    value={profileForm.name || ''}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <GhostInput
                                        type="text"
                                        placeholder="Year"
                                        value={profileForm.year || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, year: e.target.value }))}
                                    />
                                    <GhostInput
                                        type="text"
                                        placeholder="Branch"
                                        value={profileForm.branch || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, branch: e.target.value }))}
                                    />
                                </div>
                                <GhostInput
                                    type="tel"
                                    placeholder="Contact Number"
                                    value={profileForm.contactNumber || ''}
                                    onChange={(e) => setProfileForm(prev => ({ ...prev, contactNumber: e.target.value }))}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <GhostInput
                                        type="text"
                                        placeholder="GitHub (optional)"
                                        value={profileForm.github || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, github: e.target.value }))}
                                    />
                                    <GhostInput
                                        type="text"
                                        placeholder="Instagram (optional)"
                                        value={profileForm.instagram || ''}
                                        onChange={(e) => setProfileForm(prev => ({ ...prev, instagram: e.target.value }))}
                                    />
                                </div>

                                <div className="pt-1">
                                    <p className="text-sm font-semibold text-slate-700 mb-2">Skills</p>
                                    <div className="flex flex-wrap gap-2">
                                        {SKILLS_LIST.map(skill => {
                                            const SkillIcon = SKILL_ICONS[skill];
                                            const active = (profileForm.skills || []).includes(skill);
                                            return (
                                                <button
                                                    key={skill}
                                                    type="button"
                                                    onClick={() => toggleSkill(skill)}
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${active
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-orange-50 text-orange-600 hover:bg-orange-100'
                                                        }`}
                                                >
                                                    <SkillIcon size={12} /> {skill}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="flex gap-3 pt-3">
                                    <PrimaryButton className="flex-1" onClick={saveProfile} disabled={savingProfile}>
                                        <Save size={15} /> {savingProfile ? 'Saving…' : 'Save Changes'}
                                    </PrimaryButton>
                                    <OutlineButton
                                        className="flex-1"
                                        onClick={() => { setEditingProfile(false); setProfileForm(profile); }}
                                    >
                                        <X size={15} /> Cancel
                                    </OutlineButton>
                                </div>

                                <div className="flex-1" />
                            </div>
                        )}

                        <button
                            onClick={handleLogout}
                            className="w-full mt-6 inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm tracking-wide shadow-sm shadow-red-200 hover:shadow-md hover:shadow-red-200 transition-all"
                        >
                            <LogOut size={16} /> Log Out
                        </button>
                    </div>

                    {/* ============ RIGHT: TEAM CARD ============ */}
                    {myTeam ? (
                        <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-xl shadow-slate-200/60 p-7 flex flex-col h-full">
                            <div className="flex items-start justify-between mb-6 gap-3">
                                <div className="min-w-0">
                                    <p className="flex items-center gap-2 font-bold text-blue-900 text-lg truncate">
                                        {myTeam.teamName}
                                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                                            <ShieldCheck size={13} />
                                        </span>
                                    </p>
                                    <p className="text-xs text-slate-400 mt-0.5">{isLeader ? 'You are the Team Leader' : 'Team Member'}</p>
                                </div>
                                {isLeader && !editingTeam && (
                                    <div className="flex gap-2 shrink-0">
                                        <OutlineButton onClick={() => setPage && setPage('find-teammates')}>
                                            <UserPlus size={13} /> Invite
                                        </OutlineButton>
                                        <PrimaryButton onClick={() => setEditingTeam(true)}>
                                            <Pencil size={13} /> Edit Team
                                        </PrimaryButton>
                                    </div>
                                )}
                            </div>

                            {!editingTeam ? (
                                <>
                                    {myTeam.problemStatement && (
                                        <StatTile label="Problem Statement" value={myTeam.problemStatement} icon={FileText} />
                                    )}

                                    <p className="text-xs font-medium text-slate-400 mt-5 mb-2">Team Leader</p>
                                    <div className="flex items-center justify-between bg-orange-50 rounded-xl px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-orange-400 text-white flex items-center justify-center text-xs font-bold shrink-0">
                                                {myTeam.leader?.name?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <p className="font-semibold text-blue-900 text-sm">{myTeam.leader?.name}</p>
                                        </div>
                                        <p className="text-xs text-slate-500">{myTeam.leader?.branch} — {myTeam.leader?.year}</p>
                                    </div>

                                    <p className="text-xs font-medium text-slate-400 mt-5 mb-2">
                                        Members ({(myTeam.members || []).length})
                                    </p>
                                    {(myTeam.members || []).length > 0 ? (
                                        <div className="space-y-2">
                                            {myTeam.members.map((m, i) => (
                                                <div key={i} className="flex items-center justify-between bg-slate-50 rounded-xl px-4 py-3">
                                                    <p className="font-semibold text-blue-900 text-sm">{m.name}</p>
                                                    <p className="text-xs text-slate-500">{m.branch} — {m.year}</p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-indigo-200 bg-indigo-50/20 rounded-2xl py-10 text-center">
                                            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mb-3">
                                                <Users size={22} />
                                            </div>
                                            <p className="font-bold text-blue-900">No members yet</p>
                                            <p className="text-sm text-slate-400 mt-1">Invite your first teammate and get started!</p>
                                        </div>
                                    )}

                                    <div className="flex-1" />
                                </>
                            ) : (
                                <div className="space-y-3">
                                    <GhostInput
                                        type="text"
                                        placeholder="Team Name"
                                        value={teamForm.teamName || ''}
                                        onChange={(e) => setTeamForm(prev => ({ ...prev, teamName: e.target.value }))}
                                        className="font-semibold"
                                    />
                                    <textarea
                                        placeholder="Problem Statement"
                                        value={teamForm.problemStatement || ''}
                                        onChange={(e) => setTeamForm(prev => ({ ...prev, problemStatement: e.target.value }))}
                                        className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm h-24 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300"
                                    />

                                    <p className="text-sm font-semibold text-slate-700 pt-1">Members</p>
                                    {(teamForm.members || []).map((m, i) => (
                                        <div key={i} className="bg-slate-50 rounded-xl p-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <GhostInput
                                                    type="text"
                                                    placeholder="Name"
                                                    value={m.name || ''}
                                                    onChange={(e) => updateTeamMember(i, 'name', e.target.value)}
                                                    className="min-w-0 flex-1 bg-white"
                                                />
                                                <button
                                                    onClick={() => removeTeamMember(i)}
                                                    className="shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                                                    title="Remove member"
                                                >
                                                    <X size={15} />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <GhostInput
                                                    type="text"
                                                    placeholder="Year"
                                                    value={m.year || ''}
                                                    onChange={(e) => updateTeamMember(i, 'year', e.target.value)}
                                                    className="bg-white"
                                                />
                                                <GhostInput
                                                    type="text"
                                                    placeholder="Branch"
                                                    value={m.branch || ''}
                                                    onChange={(e) => updateTeamMember(i, 'branch', e.target.value)}
                                                    className="bg-white"
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex gap-3 pt-3">
                                        <PrimaryButton className="flex-1" onClick={saveTeam} disabled={savingTeam}>
                                            <Save size={15} /> {savingTeam ? 'Saving…' : 'Save Team'}
                                        </PrimaryButton>
                                        <OutlineButton
                                            className="flex-1"
                                            onClick={() => { setEditingTeam(false); setTeamForm(myTeam); }}
                                        >
                                            <X size={15} /> Cancel
                                        </OutlineButton>
                                    </div>

                                    <div className="flex-1" />
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl border-2 border-indigo-100 shadow-xl shadow-slate-200/60 p-7 flex flex-col h-full items-center justify-center text-center">
                            <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-500 flex items-center justify-center mb-3">
                                <Users size={22} />
                            </div>
                            <p className="font-bold text-blue-900 text-lg mb-1.5">No Team Yet</p>
                            <p className="text-slate-500 text-sm max-w-xs">
                                You haven't joined or created a team yet. Check "Find Teammates" or register a team.
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-2 mt-8 text-xs text-slate-400">
                    <ShieldCheck size={13} className="text-indigo-300" />
                    <span>Smart India Hackathon 2026 &nbsp;•&nbsp; Build &nbsp;•&nbsp; Innovate &nbsp;•&nbsp; Impact</span>
                </div>
            </div>
        </div>
    );
}