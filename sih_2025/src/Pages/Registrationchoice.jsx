import React from "react";
import { Users, User, ArrowLeft } from "lucide-react";
import { useAuth } from "../AuthContext.jsx";

export default function RegistrationChoice({ setPage }) {
    const { isRegistered } = useAuth();

    if (isRegistered) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center px-4 py-16">
                <div className="text-center max-w-md">
                    <h1 className="text-3xl font-black text-blue-900 mb-3">
                        Already Registered
                    </h1>
                    <p className="text-slate-600 mb-6">
                        You've already completed your registration. Check your profile for details.
                    </p>
                    <button
                        onClick={() => setPage('profile')}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold"
                    >
                        Go to Profile
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white px-4 py-16 relative">

            {/* Back button */}
            <button
                type="button"
                onClick={() => setPage("home")}
                className="absolute top-6 left-6 flex items-center gap-2 text-blue-900 font-bold text-lg border-2 border-blue-900 rounded-lg px-4 py-2 hover:bg-blue-900 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-6 h-6" />
                Back
            </button>

            <div className="text-center mb-20 pt-8">
                <h1 className="text-6xl font-black text-orange-500 tracking-wide mb-3">
                    REGISTRATION
                </h1>
                <p className="text-lg text-slate-600">
                    Choose how you want to register for SIH 2026
                </p>
            </div>

            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "2rem",
                    maxWidth: "56rem",
                    margin: "0 auto",
                }}
            >

                <button
                    type="button"
                    onClick={() => setPage("team-register")}
                    style={{ flex: "1 1 300px" }}
                    className="bg-orange-50 border-2 border-orange-400 rounded-xl px-8 py-10 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="w-24 h-24 mx-auto rounded-full border-4 border-orange-400 bg-white flex items-center justify-center mb-6">
                        <Users className="w-10 h-10 text-orange-500" />
                    </div>

                    <h2 className="text-xl font-bold text-blue-900 mb-3 uppercase">
                        Register as a Team
                    </h2>

                    <p className="text-slate-700">
                        Form a team with up to 6 members and submit your idea together.
                    </p>
                </button>

                <button
                    type="button"
                    onClick={() => setPage("individual-register")}
                    style={{ flex: "1 1 300px" }}
                    className="bg-orange-50 border-2 border-orange-400 rounded-xl px-8 py-10 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                    <div className="w-24 h-24 mx-auto rounded-full border-4 border-orange-400 bg-white flex items-center justify-center mb-6">
                        <User className="w-10 h-10 text-orange-500" />
                    </div>

                    <h2 className="text-xl font-bold text-blue-900 mb-3 uppercase">
                        Register Individual
                    </h2>

                    <p className="text-slate-700">
                        Register on your own and get matched with a team later.
                    </p>
                </button>

            </div>
        </div>
    );
}