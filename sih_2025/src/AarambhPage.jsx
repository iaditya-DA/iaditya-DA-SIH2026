import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    collection,
    query,
    where,
    onSnapshot,
    doc,
    setDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { auth, db } from './firebaseClient.js';

const MAX_PPT_BYTES = 700 * 1024; // ~700 KB — stays safely under Firestore's 1 MiB doc limit after base64 inflation

// ===== PLACEHOLDER PROBLEM STATEMENTS — edit titles/org/theme/deadline later =====
// `fullDescription` powers the "View Full" modal — fill these in with the real
// problem statement text later; the modal falls back gracefully if left blank.
const PROBLEM_STATEMENTS = [
    {
        psNumber: 'AA001',
        title: 'AI-Powered Smart Flood Response & Rescue System for Assam',
        organization: 'LNCT University',
        category: 'Software (AI/ML | IoT | GIS | Mobile/web Application)',
        theme: 'Disaster Management',
        deadline: '2026-08-12',
        fullDescription: `Every year, floods in Assam displace thousands of people, damage infrastructure, disrupt communication, and delay rescue operations. Despite the availability of weather forecasts and disaster alerts, there is no unified platform that integrates flood prediction, citizen SOS reporting, rescue coordination, and relief management in real time.

Design and develop a technology solution that enables government agencies, disaster response teams, NGOs, and citizens to efficiently manage flood emergencies. The solution should support real-time flood monitoring, AI-based risk prediction, emergency reporting, rescue coordination, relief camp information, and transparent distribution of essential supplies while remaining functional in low-connectivity areas.`
    },
    {
        psNumber: 'AA002',
        title: 'Smart Digital Experience for Shri Mahakaleshwar Temple',
        organization: 'LNCT University',
        category: 'Software (AI/ML | GIS | Mobile/web Application | AR/VR)',
        theme: 'Heritage & Culture',
        deadline: '2026-08-12',
        fullDescription: `Shri Mahakaleshwar Temple in Ujjain attracts millions of devotees and tourists every year, leading to challenges such as overcrowding, long waiting times, limited access to authentic historical information, and difficulty in navigating temple premises and nearby heritage sites. Existing digital services provide limited assistance in enhancing the overall visitor experience.

Design and develop a smart technology solution that improves the pilgrimage experience through AI-powered crowd management, real-time queue updates, digital navigation, multilingual virtual guides, and interactive heritage information. The platform should help devotees plan their visit efficiently, reduce congestion, promote the historical and cultural significance of the temple, and support authorities in managing visitor flow during festivals and peak seasons.`
    },
    {
        psNumber: 'AA003',
        title: 'Smart Campus Navigation & Student Assistant',
        organization: 'LNCT University',
        category: 'Software (AI/ML | Mobile Application | GIS)',
        theme: 'Education',
        deadline: '2026-08-12',
        fullDescription: `New students often face difficulty locating classrooms, laboratories, faculty offices, hostels, libraries, and administrative departments within the campus. They also struggle to access important services such as timetables, transport information, event updates, and grievance support from a single platform.

Design and develop a smart campus assistant that helps students navigate the campus and access essential college services through a unified mobile or web application. The solution should improve the overall campus experience by providing seamless navigation, real-time information, and easy access to student resources.`
    },
    {
        psNumber: 'AA004',
        title: 'Open Innovation',
        organization: 'LNCT University',
        category: 'Software/Hardware',
        theme: 'Open Innovation',
        deadline: '2026-08-12',
        fullDescription: `Open Innovation Track is designed for participants who want to solve real-world problems beyond predefined problem statements. Students, researchers, startups, and innovators can identify any challenge that creates meaningful social, industrial, environmental, healthcare, educational, or technological impact and propose their own innovative solution. Participants are free to choose any domain and develop a software, hardware, or hybrid prototype. Evaluation will focus on originality, innovation, feasibility, technical implementation, scalability, and potential impact.`
    },
];

const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

export default function AarambhPage({ setPage, showToast, showAlert }) {
    const [role, setRole] = useState(null); // 'leader' | 'member' | 'unassigned' | null
    const [myTeam, setMyTeam] = useState(null);
    const [mySubmission, setMySubmission] = useState(null);
    const [counts, setCounts] = useState({});
    const [loading, setLoading] = useState(true);

    const [selectedTrack, setSelectedTrack] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    // Problem statement currently open in the "View Full" modal (null = closed)
    const [viewPS, setViewPS] = useState(null);

    // ---- Role + team detection ----
    useEffect(() => {
        const user = auth.currentUser;
        if (!user) { setLoading(false); return; }

        let unsubSubmission = null;

        const leaderQuery = query(collection(db, 'teams'), where('leader.uid', '==', user.uid));
        const unsubLeader = onSnapshot(leaderQuery, (leaderSnap) => {
            if (unsubSubmission) { unsubSubmission(); unsubSubmission = null; }

            if (!leaderSnap.empty) {
                const teamData = { id: leaderSnap.docs[0].id, ...leaderSnap.docs[0].data() };
                setMyTeam(teamData);
                setRole('leader');

                unsubSubmission = onSnapshot(doc(db, 'aarambhSubmissions', teamData.id), (subSnap) => {
                    if (subSnap.exists()) {
                        const data = subSnap.data();
                        setMySubmission(data);
                        setSelectedTrack(data.track || null);
                    } else {
                        setMySubmission(null);
                    }
                    setLoading(false);
                });
            } else {
                // Check profile for teamId (member) vs fully unassigned
                onSnapshot(doc(db, 'users', user.uid), (profileSnap) => {
                    const profile = profileSnap.exists() ? profileSnap.data() : null;
                    if (profile?.teamId) {
                        setRole('member');
                        // Read-only: still fetch team + submission for display
                        onSnapshot(doc(db, 'teams', profile.teamId), (teamSnap) => {
                            if (teamSnap.exists()) setMyTeam({ id: teamSnap.id, ...teamSnap.data() });
                        });
                        if (unsubSubmission) unsubSubmission();
                        unsubSubmission = onSnapshot(doc(db, 'aarambhSubmissions', profile.teamId), (subSnap) => {
                            setMySubmission(subSnap.exists() ? subSnap.data() : null);
                        });
                    } else {
                        setRole('unassigned');
                    }
                    setLoading(false);
                });
            }
        }, (err) => {
            console.error('Failed to load team info:', err);
            showAlert && showAlert('Failed to load your team info.');
            setLoading(false);
        });

        return () => {
            unsubLeader();
            if (unsubSubmission) unsubSubmission();
        };
    }, []);

    // ---- Live submission counts per track ----
    useEffect(() => {
        const unsub = onSnapshot(collection(db, 'aarambhSubmissions'), (snap) => {
            const tally = {};
            snap.docs.forEach((d) => {
                const track = d.data().track;
                if (track) tally[track] = (tally[track] || 0) + 1;
            });
            setCounts(tally);
        });
        return unsub;
    }, []);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const validExt = ['.ppt', '.pptx', '.pdf'];
        const nameLower = file.name.toLowerCase();
        if (!validExt.some(ext => nameLower.endsWith(ext))) {
            showAlert && showAlert('Please upload a PPT, PPTX, or PDF file.');
            e.target.value = '';
            return;
        }

        if (file.size > MAX_PPT_BYTES) {
            showAlert && showAlert(
                `File too large (${(file.size / 1024).toFixed(0)} KB). Max allowed is ${MAX_PPT_BYTES / 1024} KB — please compress your file and try again.`
            );
            e.target.value = '';
            return;
        }

        setSelectedFile(file);
    };

    const handleSubmit = async () => {
        if (!selectedTrack) {
            showAlert && showAlert('Please select a track / problem statement first.');
            return;
        }
        if (!selectedFile && !mySubmission) {
            showAlert && showAlert('Please upload your PPT.');
            return;
        }

        try {
            setSubmitting(true);
            const user = auth.currentUser;

            let pptBase64 = mySubmission?.pptBase64 || null;
            let pptFileName = mySubmission?.pptFileName || null;

            if (selectedFile) {
                pptBase64 = await fileToBase64(selectedFile);
                pptFileName = selectedFile.name;
            }

            await setDoc(doc(db, 'aarambhSubmissions', myTeam.id), {
                teamId: myTeam.id,
                teamName: myTeam.teamName,
                track: selectedTrack,
                pptBase64,
                pptFileName,
                submittedBy: user.uid,
                submittedAt: serverTimestamp(),
            }, { merge: true });

            showToast && showToast('Submission saved successfully!');
            setSelectedFile(null);

        } catch (err) {
            console.error('Failed to submit:', err);
            showAlert && showAlert('Failed to submit. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex justify-center items-center">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    // Only the team leader can actually pick a track and submit a PPT.
    // Members (in a team, not leader) and unassigned individuals get a
    // read-only view of the page — they can browse problem statements,
    // but the Select / Submit UI is hidden for them.
    const isMember = role === 'member';
    const isUnassigned = role === 'unassigned';
    const canSubmit = role === 'leader';

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="max-w-[95rem] mx-auto space-y-10">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-blue-900 mb-3">Register for Aarambh</h1>
                    <p className="text-slate-600 text-lg">Select your track and submit your PPT.Use official PPT Templeate(IDEA PPT) of SIH 2026 Download it from Nav Bar </p>
                    {myTeam && (
                        <p className="text-sm text-orange-600 font-semibold mt-2">Team: {myTeam.teamName}</p>
                    )}
                </div>

                {isMember && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium rounded-2xl p-4 text-center">
                        Only your team leader can select the track and submit the PPT. You can view the status below.
                    </div>
                )}

                {isUnassigned && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-800 text-sm font-medium rounded-2xl p-4 text-center flex flex-col md:flex-row items-center justify-center gap-3">
                        <span>You're not part of a team yet. Browse the problem statements below — to submit an idea, you'll first need to join or create a team.</span>
                        <button
                            onClick={() => setPage && setPage('find-teammates')}
                            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-2 rounded-xl font-bold transition-colors whitespace-nowrap"
                        >
                            Find Teammates →
                        </button>
                    </div>
                )}

                {/* Problem Statement Table */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left table-fixed min-w-[1400px]">
                            <colgroup>
                                <col className="w-16" />
                                <col className="w-40" />
                                <col className="w-[34%]" />
                                <col className="w-64" />
                                <col className="w-28" />
                                <col className="w-20" />
                                <col className="w-40" />
                                <col className="w-28" />
                                <col className="w-28" />
                                {canSubmit && <col className="w-28" />}
                            </colgroup>
                            <thead className="bg-blue-900 text-white uppercase text-xs tracking-wide">
                                <tr>
                                    <th className="px-4 py-3 whitespace-nowrap">S.No.</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Organization</th>
                                    <th className="px-4 py-3">Problem Statement Title</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3 whitespace-nowrap">PS Number</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Ideas</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Theme</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Deadline</th>
                                    <th className="px-4 py-3 whitespace-nowrap">Details</th>
                                    {canSubmit && <th className="px-4 py-3 whitespace-nowrap">Select</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {PROBLEM_STATEMENTS.map((ps, i) => (
                                    <tr
                                        key={ps.psNumber}
                                        className={`border-t border-gray-100 align-top ${selectedTrack === ps.psNumber ? 'bg-orange-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <td className="px-4 py-4 text-slate-600">{i + 1}</td>
                                        <td className="px-4 py-4 text-slate-700">{ps.organization}</td>
                                        <td className="px-4 py-4 font-semibold text-blue-900 leading-snug whitespace-normal break-words">{ps.title}</td>
                                        <td className="px-4 py-4 text-slate-600 leading-snug whitespace-normal break-words">{ps.category}</td>
                                        <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{ps.psNumber}</td>
                                        <td className="px-4 py-4 text-slate-600 text-center">{counts[ps.psNumber] || 0}</td>
                                        <td className="px-4 py-4 text-slate-600 whitespace-normal break-words">{ps.theme}</td>
                                        <td className="px-4 py-4 text-slate-600 whitespace-nowrap">{ps.deadline}</td>
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={() => setViewPS(ps)}
                                                className="px-3 py-1.5 rounded-full text-xs font-bold bg-blue-50 text-blue-800 hover:bg-blue-100 transition-colors whitespace-nowrap"
                                            >
                                                View Full
                                            </button>
                                        </td>
                                        {canSubmit && (
                                            <td className="px-4 py-4">
                                                <button
                                                    onClick={() => setSelectedTrack(ps.psNumber)}
                                                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-colors whitespace-nowrap ${selectedTrack === ps.psNumber
                                                        ? 'bg-orange-500 text-white'
                                                        : 'bg-gray-100 text-slate-700 hover:bg-gray-200'
                                                        }`}
                                                >
                                                    {selectedTrack === ps.psNumber ? 'Selected' : 'Select'}
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Submission Card — leader only */}
                {canSubmit && (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8 space-y-6">
                        <h2 className="text-xl font-bold text-blue-900">Submit Your Solution</h2>

                        {mySubmission && (
                            <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-2xl p-4">
                                ✅ You've already submitted for track <strong>{mySubmission.track}</strong>
                                {mySubmission.pptFileName && <> — file: <strong>{mySubmission.pptFileName}</strong></>}.
                                You can resubmit below (this will overwrite your previous submission).
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Selected Track {selectedTrack ? `— ${selectedTrack}` : '(none selected above)'}
                            </label>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Upload PDF (max {MAX_PPT_BYTES / 1024} KB)
                            </label>
                            <input
                                type="file"
                                accept=".pdf"
                                onChange={handleFileChange}
                                className="w-full border border-gray-300 rounded-xl px-4 py-2 text-sm"
                            />
                            {selectedFile && (
                                <p className="text-xs text-slate-500 mt-2">
                                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-2xl font-bold transition-colors"
                        >
                            {submitting ? 'Submitting...' : mySubmission ? 'Resubmit' : 'Submit'}
                        </button>
                    </div>
                )}

                {/* Read-only status for members and unassigned individuals */}
                {!canSubmit && (
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 md:p-8">
                        <h2 className="text-xl font-bold text-blue-900 mb-4">Submission Status</h2>
                        {isMember && (
                            mySubmission ? (
                                <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-2xl p-4">
                                    ✅ Submitted for track <strong>{mySubmission.track}</strong>
                                    {mySubmission.pptFileName && <> — file: <strong>{mySubmission.pptFileName}</strong></>}
                                </div>
                            ) : (
                                <p className="text-slate-500">Your team hasn't submitted yet.</p>
                            )
                        )}
                        {isUnassigned && (
                            <p className="text-slate-500">
                                Join or create a team to submit an idea. Once you're in a team, your leader can select a track and upload your PPT.
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* View Full — Problem Statement modal */}
            <AnimatePresence>
                {viewPS && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
                        onClick={() => setViewPS(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 10 }}
                            className="relative bg-white border-2 border-orange-200 p-8 rounded-3xl shadow-2xl w-full max-w-lg text-left"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setViewPS(null)}
                                aria-label="Close"
                                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-slate-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <p className="text-xs font-bold text-orange-600 mb-1 uppercase tracking-wide">{viewPS.psNumber}</p>
                            <h3 className="text-2xl font-black text-blue-900 mb-4 pr-8">{viewPS.title}</h3>

                            <div className="space-y-2 text-sm text-slate-700 mb-4">
                                <p><span className="font-semibold text-slate-900">Organization:</span> {viewPS.organization}</p>
                                <p><span className="font-semibold text-slate-900">Category:</span> {viewPS.category}</p>
                                <p><span className="font-semibold text-slate-900">Theme:</span> {viewPS.theme}</p>
                                <p><span className="font-semibold text-slate-900">Deadline:</span> {viewPS.deadline}</p>
                            </div>

                            {viewPS.fullDescription ? (
                                <p className="text-sm text-slate-600 leading-relaxed border-t border-gray-100 pt-4 whitespace-pre-line">
                                    {viewPS.fullDescription}
                                </p>
                            ) : (
                                <p className="text-sm text-slate-400 italic border-t border-gray-100 pt-4">
                                    Full description coming soon.
                                </p>
                            )}

                            {canSubmit && (
                                <button
                                    onClick={() => { setSelectedTrack(viewPS.psNumber); setViewPS(null); }}
                                    className="mt-6 w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-2xl font-bold transition-colors"
                                >
                                    {selectedTrack === viewPS.psNumber ? 'Selected — Close' : 'Select This Track'}
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}