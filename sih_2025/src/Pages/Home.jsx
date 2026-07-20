import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseClient.js';
import { useAuth } from '../AuthContext.jsx';

const SKILLS_LIST = ['Frontend', 'Backend', 'AI/ML', 'App Development', 'Web Development', 'UI/UX Design', 'Project Management', 'Communication', 'Presentation', 'Cloud Computing', 'Cybersecurity', 'Blockchain'];
const DEV_SKILLS = ['Frontend', 'Backend', 'AI/ML', 'App Development', 'Web Development', 'Cloud Computing', 'Cybersecurity', 'Blockchain'];

const BackArrowIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <polyline points="15 18 9 12 15 6"></polyline>
    </svg>
);

const SkillsSelector = ({ selectedSkills, onSkillsChange }) => {
    const toggleSkill = (skill) => {
        const newSkills = selectedSkills.includes(skill)
            ? selectedSkills.filter(s => s !== skill)
            : [...selectedSkills, skill];
        onSkillsChange(newSkills);
    };

    return (
        <div className="flex flex-wrap gap-2">
            {SKILLS_LIST.map(skill => (
                <button
                    type="button"
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all duration-200 ${selectedSkills.includes(skill) ? 'bg-orange-500 text-white font-bold shadow-md' : 'bg-gray-100 border border-gray-300 text-slate-700 hover:bg-gray-200'}`}
                >
                    {skill}
                </button>
            ))}
        </div>
    );
};

export const IndividualRegistration = ({ setPage, showToast, showAlert, refetchParticipants }) => {
    const { user, refreshRegistration } = useAuth();
    const [formData, setFormData] = useState({
        name: '', year: '1st Year', branch: 'BCA_AIDA', skills: [],
        contactNumber: '', github: '', discord: '', instagram: '', otherSkills: '',
        hasDeployed: false, productLink: ''
    });
    const [loading, setLoading] = useState(false);

    const showDeployedCheckbox = formData.skills.some(s => DEV_SKILLS.includes(s));

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSkillsChange = (skills) => setFormData(prev => ({ ...prev, skills }));

    const registerIndividual = async (individualData) => {
        setLoading(true);
        try {
            if (!user) {
                showAlert('Please login first');
                setPage && setPage('auth');
                return;
            }

            await updateDoc(doc(db, 'users', user.uid), {
                teamId: null,
                name: individualData.name,
                year: individualData.year,
                branch: individualData.branch,
                skills: individualData.skills,
                otherSkills: individualData.otherSkills,
                contactNumber: individualData.contactNumber,
                github: individualData.github,
                discord: individualData.discord,
                instagram: individualData.instagram,
                hasDeployed: individualData.hasDeployed,
                productLink: individualData.productLink,
                registered: true,
                role: 'individual',
            });

            // Refresh the auth context's isRegistered flag immediately so pages
            // like "Find Teammates" don't wrongly say "register first" until reload.
            await refreshRegistration();

            showToast('Individual registration successful!');
            refetchParticipants && refetchParticipants();
            if (window.confetti) window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            setTimeout(() => setPage('registered'), 1000);
        } catch (error) {
            console.error("Failed to register individual:", error);
            showAlert('Failed to register. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.name || !formData.contactNumber || !formData.instagram || !formData.year || !formData.branch) {
            showAlert("Please fill in all required fields.");
            return;
        }
        registerIndividual(formData);
    };

    return (
        <div className="flex-grow p-4 md:p-8 text-slate-800 pb-20 relative">
            <button
                type="button"
                onClick={() => setPage && setPage('registration-choice')}
                className="absolute top-4 left-4 flex items-center gap-2 text-blue-900 font-bold text-lg border-2 border-blue-900 rounded-lg px-4 py-2 hover:bg-blue-900 hover:text-white transition-colors bg-white z-10"
            >
                <BackArrowIcon className="w-6 h-6" />
                Back
            </button>
            <h2 className="text-4xl font-bold text-center mb-8 text-blue-900">Individual Registration</h2>
            <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white shadow-xl p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6">
                <input name="name" value={formData.name} onChange={handleChange} type="text" placeholder="Full Name" required className="w-full bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <select name="year" value={formData.year} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition">
                        <option>1st Year</option><option>2nd Year</option><option>3rd Year</option><option>4th Year</option>
                    </select>
                    <select name="branch" value={formData.branch} onChange={handleChange} required className="w-full bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition">
                        <option>BCA_AIDA</option><option>BCA</option><option>MCA_AIML</option><option>MCA</option><option>CSE</option><option>Other BRANCH</option>
                    </select>
                </div>
                <div className="space-y-2">
                    <label className="text-slate-700 font-semibold">Your Skills</label>
                    <SkillsSelector selectedSkills={formData.skills} onSkillsChange={handleSkillsChange} />
                </div>
                <input name="otherSkills" value={formData.otherSkills} onChange={handleChange} type="text" placeholder="Other skills (comma-separated)" className="w-full bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="contactNumber" value={formData.contactNumber} onChange={handleChange} type="tel" placeholder="Contact Number" required className="w-full bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                    <input name="instagram" value={formData.instagram} onChange={handleChange} type="text" placeholder="Instagram Username" required className="w-full bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input name="github" value={formData.github} onChange={handleChange} type="url" placeholder="GitHub Link (Optional)" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                    <input name="discord" value={formData.discord} onChange={handleChange} type="text" placeholder="Discord ID (Optional)" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                </div>
                {showDeployedCheckbox && (
                    <div className="space-y-4 pt-4 border-t border-gray-200">
                        <label className="flex items-center space-x-3 text-lg cursor-pointer">
                            <input name="hasDeployed" checked={formData.hasDeployed} onChange={handleChange} type="checkbox" className="w-5 h-5 bg-gray-100 border-gray-300 rounded text-orange-500 focus:ring-orange-500" />
                            <span className="text-slate-800 font-medium">Have you ever deployed a real software product?</span>
                        </label>
                        {formData.hasDeployed && <input name="productLink" value={formData.productLink} onChange={handleChange} type="url" placeholder="Link to product (Optional)" required={formData.hasDeployed} className="w-full bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />}
                    </div>
                )}
                <button type="submit" disabled={loading} className="w-full py-4 text-xl bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed">
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
            </form>
        </div>
    );
};