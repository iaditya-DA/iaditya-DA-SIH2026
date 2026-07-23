import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

// ---------------------------------------------------------------------------
// Shared visual building blocks — mirrors the tokens used on the Registered
// Participants page (orange/blue chips, hairline dividers, dashed empty
// states) so the whole app reads as one product instead of separate screens.
// ---------------------------------------------------------------------------

const getInitials = (name = '') =>
    name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?';

const Avatar = ({ name, tone = 'orange', size = 'md' }) => {
    const tones = {
        orange: 'bg-orange-100 text-orange-700 border-orange-300',
        blue: 'bg-blue-100 text-blue-800 border-blue-300',
    };
    const sizes = {
        sm: 'w-9 h-9 text-xs',
        md: 'w-11 h-11 text-sm',
    };
    return (
        <div className={`rounded-full border-2 flex items-center justify-center font-bold flex-shrink-0 ${tones[tone]} ${sizes[size]}`}>
            {getInitials(name)}
        </div>
    );
};

const Icon = {
    check: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    cross: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
    trash: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7h12z" />
        </svg>
    ),
    clock: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-3.5 h-3.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l2.5 2.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    team: (
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
        </svg>
    ),
    mail: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4V6zm0 0l8 7 8-7" />
        </svg>
    ),
    handshake: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2 12l4-4 4 3 4-3 4 3 4-4M6 15l3 3 3-3M12 18l2 2 3-3" />
        </svg>
    ),
    send: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
        </svg>
    ),
    link: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5l4-4a3.5 3.5 0 10-5-5l-4 4m-3 3l-4 4a3.5 3.5 0 105 5l4-4M9 15l6-6" />
        </svg>
    ),
};

const SkillTag = ({ children }) => (
    <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
        {children}
    </span>
);

const StatusBadge = ({ status }) => {
    const styles = {
        pending: 'bg-amber-50 text-amber-700 border-amber-200',
        accepted: 'bg-green-50 text-green-700 border-green-200',
        rejected: 'bg-red-50 text-red-600 border-red-200',
        cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
    };
    return (
        <span className={`inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wide border rounded-full px-2.5 py-1 ${styles[status] || styles.cancelled}`}>
            {status === 'pending' && Icon.clock}
            {status}
        </span>
    );
};

// Icon chip + title + count pill — same pattern as the stat cards on the
// participants page, so every section opens the same way.
const SectionHeader = ({ icon, title, count, tone = 'blue' }) => {
    const chipClasses = tone === 'orange'
        ? 'bg-orange-50 text-orange-600 border-orange-200'
        : 'bg-blue-50 text-blue-700 border-blue-200';
    return (
        <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${chipClasses}`}>
                {icon}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-blue-900">{title}</h2>
                {typeof count === 'number' && count > 0 && (
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-full px-2.5 py-1">
                        {count}
                    </span>
                )}
            </div>
        </div>
    );
};

const EmptyState = ({ icon, title }) => (
    <div className="text-center py-10 bg-white border-2 border-dashed border-gray-200 rounded-2xl">
        <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-gray-50 flex items-center justify-center text-gray-300">
            {icon}
        </div>
        <p className="text-slate-500 font-medium">{title}</p>
    </div>
);

const InfoBlock = ({ label, children }) => (
    <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
        <div className="text-sm text-slate-600 break-words">{children}</div>
    </div>
);

const RequestCard = ({ children }) => (
    <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-orange-200 transition-colors flex flex-col h-full"
    >
        {children}
    </motion.div>
);

const ActionButton = ({ children, icon, tone = 'ghost', ...props }) => {
    const toneClasses = {
        green: 'bg-green-600 hover:bg-green-700 disabled:bg-green-300 text-white',
        red: 'bg-white border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50',
        ghost: 'bg-white border border-gray-200 text-slate-600 hover:bg-gray-50 disabled:opacity-50',
    }[tone];
    return (
        <button
            {...props}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-sm transition-colors ${toneClasses}`}
        >
            {icon}
            {children}
        </button>
    );
};

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
            <div className="min-h-screen flex items-center justify-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        className="w-16 h-16 border-4 border-orange-400 border-t-transparent rounded-full mx-auto mb-4"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <p className="text-xl text-slate-400">Loading your requests...</p>
                </motion.div>
            </div>
        );
    }

    const actionableCount = incomingJoinRequests.length + invitesReceived.length + peerReceived.length;

    return (
        <div className="min-h-screen bg-gray-50 px-4 py-10">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-black text-blue-900 text-center mb-2">My Requests</h1>
                <p className="text-center text-sm text-slate-400 mb-3">
                    Join requests, invites and team-up offers, all in one place.
                </p>
                {actionableCount > 0 && (
                    <div className="flex justify-center mb-10">
                        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-3 py-1.5">
                            {Icon.clock} {actionableCount} waiting on your response
                        </span>
                    </div>
                )}
                {actionableCount === 0 && <div className="mb-10" />}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
                    {myTeam && (
                        <section className="bg-white border border-gray-200 rounded-3xl p-6">
                            <SectionHeader
                                icon={Icon.team}
                                title={`Join Requests — ${myTeam.teamName}`}
                                count={incomingJoinRequests.length}
                                tone="orange"
                            />
                            <p className="text-xs font-semibold text-slate-400 -mt-3 mb-4">
                                Team size: {1 + (myTeam.members?.length || 0)}/{MAX_TEAM_SIZE}
                            </p>
                            {incomingJoinRequests.length === 0 ? (
                                <EmptyState icon={Icon.team} title="No incoming join requests." />
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    <AnimatePresence>
                                        {incomingJoinRequests.map((req) => (
                                            <RequestCard key={req.id}>
                                                <div className="flex items-center gap-3 mb-3">
                                                    <Avatar name={req.individualName} tone="orange" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-black text-blue-900 truncate">{req.individualName}</p>
                                                        <p className="text-sm text-slate-400 truncate">{req.individualBranch} · {req.individualYear}</p>
                                                    </div>
                                                </div>
                                                <InfoBlock label="Contact">{req.individualContact || '—'}</InfoBlock>
                                                {(req.individualSkills || []).length > 0 && (
                                                    <div className="flex flex-wrap gap-1.5 mt-3">
                                                        {req.individualSkills.map((skill, i) => <SkillTag key={i}>{skill}</SkillTag>)}
                                                    </div>
                                                )}
                                                <div className="flex gap-2 mt-4">
                                                    <ActionButton tone="green" icon={Icon.check} onClick={() => acceptRequest(req)} disabled={actingOn === req.id}>
                                                        Accept
                                                    </ActionButton>
                                                    <ActionButton tone="red" icon={Icon.cross} onClick={() => rejectRequest(req.id)} disabled={actingOn === req.id}>
                                                        Reject
                                                    </ActionButton>
                                                </div>
                                            </RequestCard>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </section>
                    )}

                    <section className="bg-white border border-gray-200 rounded-3xl p-6">
                        <SectionHeader icon={Icon.mail} title="Team Invites Received" count={invitesReceived.length} />
                        {invitesReceived.length === 0 ? (
                            <EmptyState icon={Icon.mail} title="No team invites." />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                <AnimatePresence>
                                    {invitesReceived.map((req) => (
                                        <RequestCard key={req.id}>
                                            <p className="font-black text-blue-900 text-lg">{req.teamName}</p>
                                            <p className="text-sm text-slate-400 mb-4">invited you to join their team</p>
                                            <div className="flex gap-2 mt-auto">
                                                <ActionButton tone="green" icon={Icon.check} onClick={() => acceptRequest(req)} disabled={actingOn === req.id}>
                                                    Accept
                                                </ActionButton>
                                                <ActionButton tone="red" icon={Icon.cross} onClick={() => rejectRequest(req.id)} disabled={actingOn === req.id}>
                                                    Reject
                                                </ActionButton>
                                            </div>
                                        </RequestCard>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>

                    {/* ---- Team-Up Requests Received ---- */}
                    <section className="bg-white border border-gray-200 rounded-3xl p-6">
                        <SectionHeader icon={Icon.handshake} title="Team-Up Requests Received" count={peerReceived.length} tone="orange" />
                        {peerReceived.length === 0 ? (
                            <EmptyState icon={Icon.handshake} title="No team-up requests." />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                <AnimatePresence>
                                    {peerReceived.map((req) => (
                                        <RequestCard key={req.id}>
                                            <div className="flex items-center gap-3 mb-1">
                                                <Avatar name={req.fromName} tone="orange" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="font-black text-blue-900 truncate">{req.fromName}</p>
                                                    <p className="text-xs text-slate-400">wants to team up with you</p>
                                                </div>
                                            </div>
                                            <InfoBlock label="Proposed Team">
                                                <span className="font-semibold text-blue-900">{req.proposedTeam?.teamName}</span>
                                                {req.proposedTeam?.problemStatement && (
                                                    <p className="text-slate-500 mt-1">{req.proposedTeam.problemStatement}</p>
                                                )}
                                                {req.proposedTeam?.githubLink && (
                                                    <a
                                                        href={req.proposedTeam.githubLink}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 mt-2 text-orange-600 hover:text-orange-700 font-semibold break-all"
                                                    >
                                                        {Icon.link} {req.proposedTeam.githubLink}
                                                    </a>
                                                )}
                                            </InfoBlock>
                                            <div className="flex gap-2 mt-4">
                                                <ActionButton tone="green" icon={Icon.check} onClick={() => acceptPeerRequest(req)} disabled={actingOn === req.id}>
                                                    {actingOn === req.id ? 'Creating…' : 'Accept'}
                                                </ActionButton>
                                                <ActionButton tone="red" icon={Icon.cross} onClick={() => rejectPeerRequest(req.id)} disabled={actingOn === req.id}>
                                                    Reject
                                                </ActionButton>
                                            </div>
                                        </RequestCard>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </section>

                    <section className="bg-white border border-gray-200 rounded-3xl p-6">
                        <SectionHeader icon={Icon.send} title="Requests Sent" count={sentRequests.length} />
                        {sentRequests.length === 0 ? (
                            <EmptyState icon={Icon.send} title="No sent requests." />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {sentRequests.map((req) => (
                                    <RequestCard key={req.id}>
                                        <div className="flex items-center justify-between gap-3">
                                            <p className="font-black text-blue-900 truncate">{req.teamName}</p>
                                            <StatusBadge status={req.status} />
                                        </div>
                                    </RequestCard>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ---- Team-Up Requests Sent ---- */}
                    <section className="bg-white border border-gray-200 rounded-3xl p-6">
                        <SectionHeader icon={Icon.handshake} title="Team-Up Requests Sent" count={peerSent.length} tone="orange" />
                        {peerSent.length === 0 ? (
                            <EmptyState icon={Icon.handshake} title="No team-up requests sent yet." />
                        ) : (
                            <div className="grid grid-cols-1 gap-4">
                                {peerSent.map((req) => (
                                    <RequestCard key={req.id}>
                                        <div className="flex items-center justify-between gap-3 mb-1">
                                            <p className="font-black text-blue-900 truncate">{req.toName}</p>
                                            <StatusBadge status={req.status} />
                                        </div>
                                        <p className="text-sm text-slate-400 truncate mb-3">{req.proposedTeam?.teamName}</p>
                                        {req.status === 'pending' && (
                                            <ActionButton tone="ghost" icon={Icon.trash} onClick={() => cancelPeerRequest(req.id)} disabled={actingOn === req.id}>
                                                Cancel Request
                                            </ActionButton>
                                        )}
                                    </RequestCard>
                                ))}
                            </div>
                        )}
                    </section>

                    {myTeam && (
                        <section className="bg-white border border-gray-200 rounded-3xl p-6">
                            <SectionHeader icon={Icon.send} title="Invites Sent" count={invitesSent.length} tone="orange" />
                            {invitesSent.length === 0 ? (
                                <EmptyState icon={Icon.send} title="No invites sent yet." />
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {invitesSent.map((req) => (
                                        <RequestCard key={req.id}>
                                            <div className="flex items-center justify-between gap-3 mb-3">
                                                <p className="font-black text-blue-900 truncate">{req.individualName}</p>
                                                <StatusBadge status={req.status} />
                                            </div>
                                            {req.status === 'pending' && (
                                                <ActionButton tone="ghost" icon={Icon.trash} onClick={() => cancelInvite(req.id)} disabled={actingOn === req.id}>
                                                    Cancel Invite
                                                </ActionButton>
                                            )}
                                        </RequestCard>
                                    ))}
                                </div>
                            )}
                        </section>
                    )}
                </div>
            </div>
        </div>
    );
}