import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    runTransaction,
    increment,
} from 'firebase/firestore';
import FingerprintJS from '@fingerprintjs/fingerprintjs';
import { db } from '../firebaseClient.js';

const MAX_MARKS = 50;

const VotingPage = () => {
    const [teams, setTeams] = useState([]);
    const [marks, setMarks] = useState({}); // { teamId: number|null }
    const [deviceId, setDeviceId] = useState(null);
    const [checking, setChecking] = useState(true);
    const [alreadyVoted, setAlreadyVoted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [votingOpen, setVotingOpen] = useState(null); // null = still loading
    const [secondsLeft, setSecondsLeft] = useState(null);

    // Listen to voting on/off + timer from settings/config
    useEffect(() => {
        const unsub = onSnapshot(doc(db, 'settings', 'config'), (snap) => {
            if (!snap.exists()) {
                setVotingOpen(false);
                return;
            }
            const data = snap.data();
            setVotingOpen(data.votingOpen === true);
            if (data.votingEndsAt) {
                const endsAt = new Date(data.votingEndsAt).getTime();
                setSecondsLeft(Math.max(0, Math.round((endsAt - Date.now()) / 1000)));
            } else {
                setSecondsLeft(null);
            }
        });
        return () => unsub();
    }, []);

    // Local 1-second ticker so the countdown moves without extra reads
    useEffect(() => {
        if (!votingOpen || secondsLeft === null) return;
        if (secondsLeft <= 0) return;
        const interval = setInterval(() => {
            setSecondsLeft((s) => (s !== null ? Math.max(0, s - 1) : s));
        }, 1000);
        return () => clearInterval(interval);
    }, [votingOpen, secondsLeft === null]);

    const votingExpired = votingOpen && secondsLeft !== null && secondsLeft <= 0;

    // Load finalist teams
    useEffect(() => {
        const q = query(collection(db, 'teams'), where('finalistTeam', '==', true));
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((d) => ({ id: d.id, name: d.data().teamName || d.data().name || 'Team' }));
            setTeams(data);
            setMarks((prev) => {
                const next = { ...prev };
                data.forEach((t) => {
                    if (!(t.id in next)) next[t.id] = null;
                });
                return next;
            });
        });
        return () => unsub();
    }, []);

    // Fingerprint + duplicate-vote check
    useEffect(() => {
        (async () => {
            try {
                const fp = await FingerprintJS.load();
                const result = await fp.get();
                const id = result.visitorId;
                setDeviceId(id);

                const voteDocRef = doc(db, 'voterLog', id);
                const { getDoc } = await import('firebase/firestore');
                const existing = await getDoc(voteDocRef);
                if (existing.exists()) {
                    setAlreadyVoted(true);
                }
            } catch (e) {
                console.error('Fingerprint check failed:', e);
            } finally {
                setChecking(false);
            }
        })();
    }, []);

    const allFilled = useMemo(
        () => teams.length > 0 && teams.every((t) => marks[t.id] !== null && marks[t.id] !== undefined),
        [teams, marks]
    );

    const ratedCount = useMemo(
        () => teams.filter((t) => marks[t.id] !== null && marks[t.id] !== undefined).length,
        [teams, marks]
    );

    const handleChange = (teamId, value) => {
        setMarks((prev) => ({ ...prev, [teamId]: Number(value) }));
    };

    const handleSubmit = async () => {
        if (!allFilled || !deviceId || submitting) return;
        if (!votingOpen || votingExpired) {
            setError('Voting has closed.');
            return;
        }
        setSubmitting(true);
        setError('');

        try {
            await runTransaction(db, async (transaction) => {
                const voteDocRef = doc(db, 'voterLog', deviceId);
                const voteSnap = await transaction.get(voteDocRef);
                if (voteSnap.exists()) {
                    throw new Error('ALREADY_VOTED');
                }

                transaction.set(voteDocRef, {
                    marks,
                    timestamp: new Date().toISOString(),
                });

                teams.forEach((t) => {
                    const teamRef = doc(db, 'teams', t.id);
                    transaction.update(teamRef, {
                        audienceTotalMarks: increment(marks[t.id]),
                        audienceVoteCount: increment(1),
                    });
                });
            });

            setSubmitted(true);
        } catch (e) {
            console.error('Vote submission failed:', e);
            if (e.message === 'ALREADY_VOTED') {
                setAlreadyVoted(true);
            } else {
                setError('Could not submit your vote. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    // ---- Full-screen state components ----

    if (checking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center px-6">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-100 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-500 font-semibold">Loading…</p>
                </div>
            </div>
        );
    }

    if (alreadyVoted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center max-w-sm bg-white border-2 border-blue-100 rounded-3xl p-10 shadow-sm"
                >
                    <div className="w-16 h-16 rounded-full bg-blue-50 border-2 border-blue-200 flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-blue-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-black text-blue-900 mb-2">You've Already Voted</h2>
                    <p className="text-slate-500 font-medium">Only one vote is allowed per device. Thank you for participating!</p>
                </motion.div>
            </div>
        );
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center px-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-sm bg-white border-2 border-orange-200 rounded-3xl p-10 shadow-sm"
                >
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-20 h-20 rounded-full bg-orange-50 border-2 border-orange-300 flex items-center justify-center mx-auto mb-5"
                    >
                        <span className="text-4xl">🎉</span>
                    </motion.div>
                    <h2 className="text-2xl font-black text-blue-900 mb-2">Vote Submitted!</h2>
                    <p className="text-slate-500 font-medium">Check the live leaderboard on the smart board for results.</p>
                </motion.div>
            </div>
        );
    }

    if (!votingOpen || votingExpired) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center px-6">
                <div className="text-center max-w-sm bg-white border-2 border-gray-200 rounded-3xl p-10 shadow-sm">
                    <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-slate-200 flex items-center justify-center mx-auto mb-5">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-black text-blue-900 mb-2">Voting Is Closed</h2>
                    <p className="text-slate-400 font-medium">Please check back once voting reopens.</p>
                </div>
            </div>
        );
    }

    if (teams.length === 0) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 flex items-center justify-center px-6">
                <p className="text-slate-400 font-medium text-center">Voting hasn't started yet…</p>
            </div>
        );
    }

    const timerPct = secondsLeft !== null ? Math.max(0, Math.min(100, (secondsLeft / 90) * 100)) : 100;
    const timerLow = secondsLeft !== null && secondsLeft <= 15;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 pb-36">
            {/* Sticky header */}
            <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-xl border-b border-gray-100 px-5 pt-6 pb-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <p className="text-orange-500 font-bold uppercase tracking-widest text-xs mb-1">
                            Aarambh · Final Round
                        </p>
                        <h1 className="text-2xl font-black text-blue-900 leading-tight">Audience Voting</h1>
                    </div>

                    {secondsLeft !== null && (
                        <div className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl border-2 font-black text-sm ${timerLow ? 'bg-red-50 border-red-300 text-red-600 animate-pulse' : 'bg-orange-50 border-orange-200 text-orange-600'}`}>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, '0')}
                        </div>
                    )}
                </div>

                {/* Timer bar */}
                {secondsLeft !== null && (
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                        <motion.div
                            className={`h-full rounded-full ${timerLow ? 'bg-red-500' : 'bg-orange-400'}`}
                            animate={{ width: `${timerPct}%` }}
                            transition={{ duration: 0.5, ease: 'linear' }}
                        />
                    </div>
                )}

                {/* Rating progress */}
                <div className="flex items-center gap-3">
                    <div className="flex-1 h-2.5 bg-blue-50 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-blue-600 to-orange-500 rounded-full"
                            animate={{ width: `${(ratedCount / teams.length) * 100}%` }}
                            transition={{ duration: 0.3 }}
                        />
                    </div>
                    <span className="text-xs font-black text-blue-900 whitespace-nowrap">
                        {ratedCount}/{teams.length} rated
                    </span>
                </div>
            </div>

            {/* Team cards */}
            <div className="px-5 pt-5 space-y-4 max-w-2xl mx-auto">
                {teams.map((team, idx) => {
                    const value = marks[team.id];
                    const rated = value !== null && value !== undefined;
                    const pct = rated ? (value / MAX_MARKS) * 100 : 0;

                    return (
                        <motion.div
                            key={team.id}
                            initial={{ opacity: 0, y: 14 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: idx * 0.05 }}
                            className={`relative overflow-hidden rounded-3xl border-2 p-5 shadow-sm transition-colors ${rated ? 'border-orange-300 bg-white' : 'border-blue-100 bg-white'
                                }`}
                        >
                            <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${rated ? 'from-orange-400 to-orange-500' : 'from-blue-200 to-blue-300'}`} />

                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black flex-shrink-0">
                                        {team.name?.charAt(0)?.toUpperCase() || 'T'}
                                    </div>
                                    <span className="text-lg font-black text-blue-900 truncate">{team.name}</span>
                                </div>
                                <span className="flex-shrink-0 text-2xl font-black text-orange-500 tabular-nums">
                                    {rated ? value : '–'}
                                    <span className="text-slate-400 text-sm font-semibold">/{MAX_MARKS}</span>
                                </span>
                            </div>

                            {/* Big touch-friendly slider */}
                            <input
                                type="range"
                                min={0}
                                max={MAX_MARKS}
                                step={1}
                                value={value ?? 0}
                                onChange={(e) => handleChange(team.id, e.target.value)}
                                className="w-full h-3 rounded-full appearance-none cursor-pointer bg-white border border-blue-100 accent-orange-500"
                                style={{
                                    background: `linear-gradient(to right, #f97316 ${pct}%, #eff6ff ${pct}%)`,
                                }}
                            />

                            <div className="flex justify-between mt-2 text-[11px] font-semibold text-slate-400">
                                <span>0</span>
                                <span>25</span>
                                <span>50</span>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            <AnimatePresence>
                {error && (
                    <motion.p
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="text-center text-red-500 text-sm font-semibold mt-4 px-5"
                    >
                        {error}
                    </motion.p>
                )}
            </AnimatePresence>

            {/* Sticky submit bar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-gray-100 px-5 py-4 z-20">
                <div className="max-w-2xl mx-auto">
                    <motion.button
                        onClick={handleSubmit}
                        disabled={!allFilled || submitting}
                        whileTap={allFilled ? { scale: 0.97 } : {}}
                        className={`w-full py-4 rounded-2xl font-black text-white text-base shadow-sm transition-colors ${allFilled && !submitting
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
                            : 'bg-slate-300 cursor-not-allowed'
                            }`}
                    >
                        {submitting
                            ? 'Submitting…'
                            : allFilled
                                ? 'Submit Vote'
                                : `Rate all ${teams.length} teams to submit`}
                    </motion.button>
                </div>
            </div>
        </div>
    );
};

export default VotingPage;