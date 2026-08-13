import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseClient.js';

const RANK_STYLES = [
    { bar: 'from-orange-400 to-orange-500', badge: '🥇' },
    { bar: 'from-blue-400 to-blue-500', badge: '🥈' },
    { bar: 'from-slate-400 to-slate-500', badge: '🥉' },
];

const LiveScorePage = () => {
    const [teams, setTeams] = useState([]);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const q = query(collection(db, 'teams'), where('finalistTeam', '==', true));

        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map((docSnap) => {
                const t = docSnap.data();
                const judgeScore = t.judgeScore || 0;
                const audienceTotal = t.audienceTotalMarks || 0;
                const audienceCount = t.audienceVoteCount || 0;
                const audienceAvg = audienceCount > 0 ? audienceTotal / audienceCount : 0;
                const finalScore = judgeScore * 0.7 + audienceAvg * 0.3;

                return {
                    id: docSnap.id,
                    name: t.teamName || t.name || 'Unnamed Team',
                    judgeScore,
                    audienceAvg,
                    audienceCount,
                    finalScore,
                };
            });

            data.sort((a, b) => b.finalScore - a.finalScore);
            setTeams(data);
            setLastUpdated(new Date());
        });

        return () => unsub();
    }, []);

    const maxScore = 50;
    // Scale row density based on how many finalist teams there are so
    // everything fits on one screen without scrolling (smart-board display).
    const teamCount = teams.length;
    const isCompact = teamCount > 4;
    const isDense = teamCount > 7;

    const rowGap = isDense ? 'space-y-2.5' : isCompact ? 'space-y-3.5' : 'space-y-6';
    const barHeight = isDense ? 'h-5 md:h-6' : isCompact ? 'h-6 md:h-7' : 'h-8 md:h-9';
    const nameSize = isDense ? 'text-base md:text-lg' : isCompact ? 'text-lg md:text-xl' : 'text-lg md:text-xl';
    const scoreSize = isDense ? 'text-lg md:text-xl' : isCompact ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl';
    const badgeSize = isDense ? 'text-base' : 'text-2xl';
    const metaText = isDense ? 'text-[10px] md:text-xs' : 'text-xs md:text-sm';
    const containerPad = isDense ? 'p-4 md:p-6' : isCompact ? 'p-5 md:p-8' : 'p-6 md:p-10';

    return (
        <div className="min-h-screen bg-white px-4 py-8 md:py-12 flex flex-col">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-6xl mx-auto w-full flex-1 flex flex-col"
            >
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-6 md:mb-8">
                    <div className="text-center md:text-left">
                        <p className="text-orange-500 font-bold uppercase tracking-widest text-xs md:text-sm mb-1">
                            AARAMBH · FINAL ROUND
                        </p>
                        <h1 className="text-3xl md:text-5xl font-black text-blue-900 tracking-wide">
                            LIVE LEADERBOARD
                        </h1>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-full px-4 py-2 text-xs md:text-sm font-semibold text-blue-900">
                            Judge <span className="text-orange-500 font-black">70%</span> + Audience{' '}
                            <span className="text-orange-500 font-black">30%</span>
                        </div>
                        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-full px-4 py-2">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500" />
                            </span>
                            <span className="text-xs font-black uppercase tracking-wide text-orange-600">Live</span>
                        </div>
                    </div>
                </div>

                {teams.length === 0 ? (
                    <div className="text-center py-24 text-slate-400 text-lg font-medium">
                        Waiting for finalist teams and scores…
                    </div>
                ) : (
                    <div className={`bg-blue-50 border-2 border-blue-100 rounded-3xl ${containerPad} ${rowGap} flex-1 flex flex-col justify-center`}>
                        {teams.map((team, idx) => {
                            const style = RANK_STYLES[idx] || { bar: 'from-slate-300 to-slate-400', badge: `#${idx + 1}` };
                            const widthPct = Math.min(100, (team.finalScore / maxScore) * 100);

                            return (
                                <motion.div
                                    key={team.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.4, delay: idx * 0.04 }}
                                >
                                    <div className={`flex items-center justify-between px-1 ${isDense ? 'mb-1' : 'mb-1.5 md:mb-2'}`}>
                                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                            <span className={`${badgeSize} flex-shrink-0 ${isDense && idx > 2 ? 'text-slate-400 font-black' : ''}`}>
                                                {style.badge}
                                            </span>
                                            <span className={`${nameSize} font-black text-blue-900 truncate`}>
                                                {team.name}
                                            </span>
                                        </div>
                                        <div className="text-right flex-shrink-0 pl-2">
                                            <span className={`${scoreSize} font-black text-orange-500`}>
                                                {team.finalScore.toFixed(1)}
                                            </span>
                                            <span className="text-slate-400 font-semibold text-xs md:text-sm"> /50</span>
                                        </div>
                                    </div>

                                    <div className={`w-full ${barHeight} bg-white rounded-full overflow-hidden border border-blue-100`}>
                                        <motion.div
                                            className={`h-full rounded-full bg-gradient-to-r ${style.bar}`}
                                            initial={{ width: 0 }}
                                            animate={{ width: `${widthPct}%` }}
                                            transition={{ duration: 0.8, ease: 'easeOut' }}
                                        />
                                    </div>

                                    {!isDense && (
                                        <div className={`flex justify-between mt-1 px-1 ${metaText} text-slate-500 font-medium`}>
                                            <span>Judge: {team.judgeScore.toFixed(1)}/50</span>
                                            <span>Audience avg: {team.audienceAvg.toFixed(1)}/50 ({team.audienceCount} votes)</span>
                                        </div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                )}

                <p className="text-center text-slate-400 text-xs font-medium mt-4 md:mt-6">
                    {lastUpdated && `Last updated ${lastUpdated.toLocaleTimeString()}`} · LNCT University Bhopal
                </p>
            </motion.div>
        </div>
    );
};

export default LiveScorePage;