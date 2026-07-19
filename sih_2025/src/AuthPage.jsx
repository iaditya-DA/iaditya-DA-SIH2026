import React, { useState } from 'react';
import { signUpAndRegister, login } from './firebaseClient.js';

export default function AuthPage({ setPage, showToast, showAlert }) {
    const [mode, setMode] = useState('signup'); // 'signup' | 'login'
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [year, setYear] = useState('');
    const [branch, setBranch] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'signup') {

                if (!name.trim() || !year.trim() || !branch.trim()) {
                    showAlert && showAlert('Name, Year aur Branch bharna zaroori hai.');
                    setLoading(false);
                    return;
                }

                await signUpAndRegister({
                    email,
                    password,
                    name,
                    year,
                    branch,
                });

                showToast && showToast('Account created successfully!');
                setPage && setPage('registration-choice');

            } else {

                await login(email, password);

                showToast && showToast('Logged in successfully!');
                setPage && setPage('profile');
            }

        } catch (err) {
            console.error(err);
            showAlert && showAlert(err.message || 'Something went wrong.');

        } finally {
            setLoading(false);
        }
    };

    const inputClass =
        'w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-orange-400';

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4 py-16">
            <div className="max-w-md w-full bg-white border border-gray-200 rounded-2xl shadow-xl p-8">

                <h1 className="text-2xl font-bold text-blue-900 text-center mb-2">
                    {mode === 'signup' ? 'Create Your Account' : 'Log In'}
                </h1>

                <p className="text-slate-500 text-center text-sm mb-6">
                    {mode === 'signup'
                        ? 'Create your SIH account to continue.'
                        : 'Welcome back — log in to access your profile and teammate requests.'}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">

                    {mode === 'signup' && (
                        <>
                            <input
                                type="text"
                                required
                                placeholder="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputClass}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    required
                                    placeholder="Year"
                                    value={year}
                                    onChange={(e) => setYear(e.target.value)}
                                    className={inputClass}
                                />
                                <input
                                    type="text"
                                    required
                                    placeholder="Branch"
                                    value={branch}
                                    onChange={(e) => setBranch(e.target.value)}
                                    className={inputClass}
                                />
                            </div>
                        </>
                    )}

                    {/* Email */}
                    <input
                        type="email"
                        required
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                    />

                    {/* Password */}
                    <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Password (minimum 6 characters)"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                    />

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white p-3 rounded-lg font-semibold transition-colors"
                    >
                        {loading
                            ? 'Please wait…'
                            : mode === 'signup'
                                ? 'Create Account'
                                : 'Log In'}
                    </button>
                </form>

                {/* Toggle */}
                <button
                    onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')}
                    className="w-full text-center text-blue-900 text-sm mt-5 hover:text-orange-500 font-medium transition-colors"
                >
                    {mode === 'signup'
                        ? 'Already have an account? Log in'
                        : 'New here? Create an account'}
                </button>

            </div>
        </div>
    );
}