import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebaseClient.js';
import { useAuth } from '../AuthContext.jsx';

export default function TeamRegistration({ showToast, showAlert, setPage, refetchParticipants }) {
    const { refreshRegistration } = useAuth();
    const [form, setForm] = useState({
        teamName: '',
        problemStatement: '',
        leader: {
            name: '',
            year: '',
            branch: '',
            phone: '',
            githubLink: '',
        },
        members: [
            { name: '', year: '', branch: '', phone: '' },
            { name: '', year: '', branch: '', phone: '' },
            { name: '', year: '', branch: '', phone: '' },
            { name: '', year: '', branch: '', phone: '' },
            { name: '', year: '', branch: '', phone: '' },
        ],
    });

    const [submitting, setSubmitting] = useState(false);

    const updateLeader = (field, value) => {
        setForm(prev => ({
            ...prev,
            leader: { ...prev.leader, [field]: value },
        }));
    };

    const updateMember = (index, field, value) => {
        setForm(prev => {
            const members = [...prev.members];
            members[index] = { ...members[index], [field]: value };
            return { ...prev, members };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const filledMembers = form.members.filter(m => m.name.trim() !== '');
        if (filledMembers.length < 1) {
            showAlert('Team must have at least 2 members (1 leader + 1 member minimum).');
            return;
        }

        try {
            const user = auth.currentUser;
            if (!user) {
                showAlert('Please login first');
                return;
            }

            setSubmitting(true);

            const docRef = await addDoc(collection(db, 'teams'), {
                teamName: form.teamName,
                problemStatement: form.problemStatement,

                leader: {
                    uid: user.uid,
                    name: form.leader.name,
                    year: form.leader.year,
                    branch: form.leader.branch,
                    contactNumber: form.leader.phone,
                    githubLink: form.leader.githubLink || '',
                    skills: [],
                },

                members: filledMembers.map(m => ({
                    name: m.name,
                    year: m.year,
                    branch: m.branch,
                    contactNumber: m.phone || '',
                    skills: [],
                })),
                createdAt: serverTimestamp(),
            });

            await updateDoc(doc(db, 'users', user.uid), {
                registered: true,
                role: 'team-leader',
                teamId: docRef.id,
            });

            await refreshRegistration();

            showToast('Team registered successfully!');
            refetchParticipants && refetchParticipants();
            setPage('registered');

        } catch (err) {
            console.error(err);
            showAlert('Failed to register team');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 px-4 py-10">
            <div className="max-w-3xl mx-auto">
                <h1 className="text-4xl font-black text-blue-900 mb-8 text-center">
                    Team Registration
                </h1>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-3xl border border-gray-200 shadow-sm p-8 space-y-6"
                >
                    {/* Team Info */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Team Name</label>
                        <input
                            type="text"
                            required
                            value={form.teamName}
                            onChange={(e) => setForm(prev => ({ ...prev, teamName: e.target.value }))}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1">Problem Statement</label>
                        <input
                            type="text"
                            required
                            value={form.problemStatement}
                            onChange={(e) => setForm(prev => ({ ...prev, problemStatement: e.target.value }))}
                            className="w-full border border-gray-300 rounded-xl px-4 py-2"
                        />
                    </div>

                    {/* Leader Info */}
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-bold text-blue-900 mb-4">Team Leader</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input
                                type="text"
                                placeholder="Name"
                                required
                                value={form.leader.name}
                                onChange={(e) => updateLeader('name', e.target.value)}
                                className="border border-gray-300 rounded-xl px-4 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Year"
                                required
                                value={form.leader.year}
                                onChange={(e) => updateLeader('year', e.target.value)}
                                className="border border-gray-300 rounded-xl px-4 py-2"
                            />
                            <input
                                type="text"
                                placeholder="Branch"
                                required
                                value={form.leader.branch}
                                onChange={(e) => updateLeader('branch', e.target.value)}
                                className="border border-gray-300 rounded-xl px-4 py-2"
                            />
                            <input
                                type="tel"
                                placeholder="Contact Number"
                                required
                                value={form.leader.phone}
                                onChange={(e) => updateLeader('phone', e.target.value)}
                                className="border border-gray-300 rounded-xl px-4 py-2"
                            />
                            <input
                                type="text"
                                placeholder="GitHub Link (optional)"
                                value={form.leader.githubLink}
                                onChange={(e) => updateLeader('githubLink', e.target.value)}
                                className="border border-gray-300 rounded-xl px-4 py-2 md:col-span-2"
                            />
                        </div>
                    </div>

                    {/* Members Info */}
                    <div className="border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-bold text-blue-900 mb-4">Team Members</h2>
                        {form.members.map((member, i) => (
                            <div key={i} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                                <input
                                    type="text"
                                    placeholder={`Member ${i + 1} Name${i === 0 ? '' : ' (Optional)'}`}
                                    required={i === 0}
                                    value={member.name}
                                    onChange={(e) => updateMember(i, 'name', e.target.value)}
                                    className="border border-gray-300 rounded-xl px-4 py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Year"
                                    required={i === 0}
                                    value={member.year}
                                    onChange={(e) => updateMember(i, 'year', e.target.value)}
                                    className="border border-gray-300 rounded-xl px-4 py-2"
                                />
                                <input
                                    type="text"
                                    placeholder="Branch"
                                    required={i === 0}
                                    value={member.branch}
                                    onChange={(e) => updateMember(i, 'branch', e.target.value)}
                                    className="border border-gray-300 rounded-xl px-4 py-2"
                                />
                                <input
                                    type="tel"
                                    placeholder={`Phone${i === 0 ? '' : ' (Optional)'}`}
                                    required={i === 0}
                                    value={member.phone}
                                    onChange={(e) => updateMember(i, 'phone', e.target.value)}
                                    className="border border-gray-300 rounded-xl px-4 py-2"
                                />
                            </div>
                        ))}

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-2xl font-semibold transition-colors"
                        >
                            {submitting ? 'Registering...' : 'Register Team'}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
}