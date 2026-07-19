import React, { useState, useEffect, useRef } from 'react';
import { EpicBackground } from '../Components/AnimatedBackground.jsx';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseClient.js';
import { useAuth } from '../AuthContext.jsx';
// --- Animated Background Component ---
const ParticleBackground = () => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const particlesRef = useRef([]);
    const mouseRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];

        // Resize canvas
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Particle class
        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
                this.opacity = Math.random() * 0.5 + 0.3;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(6, 182, 212, ${this.opacity})`;
                ctx.fill();
            }
        }

        // Initialize particles
        for (let i = 0; i < 80; i++) {
            particles.push(new Particle());
        }
        particlesRef.current = particles;

        // Mouse movement handler
        const handleMouseMove = (e) => {
            mouseRef.current = {
                x: e.clientX,
                y: e.clientY
            };
        };

        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Update and draw particles
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            // Draw connections
            particles.forEach((particle, i) => {
                particles.slice(i + 1).forEach(otherParticle => {
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < 120) {
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(6, 182, 212, ${0.3 - distance / 400})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                });

                // Mouse interaction
                const dx = particle.x - mouseRef.current.x;
                const dy = particle.y - mouseRef.current.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    ctx.beginPath();
                    ctx.moveTo(particle.x, particle.y);
                    ctx.lineTo(mouseRef.current.x, mouseRef.current.y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.4 - distance / 375})`;
                    ctx.lineWidth = 2;
                    ctx.stroke();
                }
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
            style={{ background: 'transparent' }}
        />
    );
};

// --- Reusable Components ---

const SKILLS_LIST = ['Frontend', 'Backend', 'AI/ML', 'App Development', 'Web Development', 'UI/UX Design', 'Project Management', 'Communication', 'Presentation', 'Cloud Computing', 'Cybersecurity', 'Blockchain'];
const DEV_SKILLS = ['Frontend', 'Backend', 'AI/ML', 'App Development', 'Web Development', 'Cloud Computing', 'Cybersecurity', 'Blockchain'];

// Announcement Banner Component
const AnnouncementBanner = () => {
    return (
        <div className="relative bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 py-3 overflow-hidden border-b border-purple-500/30">
            <div className="absolute inset-0 bg-black/20"></div>
            <div className="relative">
                <div className="flex animate-marquee whitespace-nowrap">
                    <div className="mx-4 flex items-center space-x-8">
                        <span className="text-white font-bold text-lg flex items-center">
                            🎉 ROUND 1 RESULTS:
                        </span>
                        <span className="text-white font-semibold">
                            🎉 Round 1 Results ANNOUNCED!
                        </span>
                        <span className="text-white font-semibold">
                            PPT Round: 22 BCA/MCA teams selected 📊
                        </span>
                        <span className="text-white font-bold">
                            Team Leaders: Join WhatsApp group (check your WhatsApp!) 📱
                        </span>
                        <span className="text-white font-semibold">
                            Stay tuned for exciting updates! 🚀
                        </span>
                    </div>
                    <div className="mx-4 flex items-center space-x-8">
                        <span className="text-white font-bold text-lg flex items-center">
                            🎉 ROUND 1 RESULTS:
                        </span>
                        <span className="text-white font-semibold">
                            🎉 Round 1 Results ANNOUNCED!
                        </span>
                        <span className="text-white font-semibold">
                            PPT Round: 22 BCA/MCA teams selected 📊
                        </span>
                        <span className="text-white font-bold">
                            Team Leaders: Join WhatsApp group (check your WhatsApp!) 📱
                        </span>
                        <span className="text-white font-semibold">
                            Stay tuned for exciting updates! 🚀
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InstagramIcon = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
);

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

// --- Page Components ---

const HomePage = ({ setPage }) => {
    const [openFaq, setOpenFaq] = useState(null);
    const MOCK_TESTIMONIALS = [
        { type: 'team', text: "Team 'Quantum Coders' just registered with a fascinating idea on blockchain voting systems!" },
        { type: 'individual', text: "Aarav S., a skilled React developer, found his team and is ready to build." },
        { type: 'team', text: "The 'Data Dynamos' have joined, bringing their expertise in AI/ML to the competition." },
        { type: 'individual', text: "Priya M. from IT has teamed up with senior students for her first-ever hackathon." }
    ];
    const FAQ_DATA = [
        { q: "Where can I find the Round 1 results?", a: "Round 1 PPT presentation results are now available! Navigate to the Results section or check the announcements on the home page." },
        { q: "Are registrations still open?", a: "No, all registrations (both individual and team) are now permanently closed. Thank you for your overwhelming response!" },
        { q: "How can team leaders join the WhatsApp group?", a: "Team leaders should check their WhatsApp for the group invitation link. The invitation has been sent to the contact number provided during registration." },
        { q: "What was the team size limit?", a: "Teams consisted of a minimum of 2 members and a maximum of 6 members, including the team leader." },
        { q: "What if I have questions about my registration?", a: "Please reach out to the contacts listed at the bottom of this page for any registration-related queries." }
    ];

    useEffect(() => {
        const initAnimations = () => {
            const anime = window.anime;
            if (!anime) return;

            anime.timeline({ easing: 'easeOutExpo' })
                .add({ targets: '.title-animate', translateY: [-50, 0], opacity: [0, 1], duration: 800 })
                .add({ targets: '.subtitle-animate', translateY: [-30, 0], opacity: [0, 1], duration: 600 }, '-=400')
                .add({ targets: '.home-content-animate, .home-button', translateY: [50, 0], opacity: [0, 1], duration: 800, delay: anime.stagger(150) }, '-=600');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        anime({ targets: entry.target.querySelectorAll('.fade-in-up'), translateY: [20, 0], opacity: [0, 1], delay: anime.stagger(100), easing: 'easeOutExpo' });
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.animate-on-scroll').forEach(el => observer.observe(el));
        };

        if (window.anime) {
            initAnimations();
        } else {
            const interval = setInterval(() => {
                if (window.anime) {
                    clearInterval(interval);
                    initAnimations();
                }
            }, 100);
            return () => clearInterval(interval);
        }
    }, []);

    return (
        <div className="flex-grow text-white">
            <AnnouncementBanner />
            <div className="text-center px-4 pt-12 pb-20">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight title-animate bg-clip-text text-transparent bg-gradient-to-br from-white to-cyan-400">SIH 2026 Registration</h1>
                <p className="text-xl md:text-2xl mt-4 text-cyan-200/80 subtitle-animate">LNCT University Bhopal</p>
                <div className="home-content-animate my-10 max-w-3xl mx-auto bg-slate-800/30 p-8 rounded-2xl backdrop-blur-sm border border-slate-700/50">
                    <h2 className="text-3xl font-bold text-cyan-300 mb-4">SIH 2026 - Registration Complete! 🎉</h2>
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-4">
                        <p className="text-green-300 font-semibold">✅ All Registrations are now CLOSED</p>
                        <p className="text-green-200 text-sm mt-1">Thank you for your overwhelming response!</p>
                    </div>
                    <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4 mt-4">
                        <p className="text-green-300 font-semibold">🎉 Round 1 Results ANNOUNCED!</p>
                        <p className="text-green-200 text-sm mt-1">PPT Round results are now available!</p>
                    </div>
                    <div className="bg-purple-500/20 border border-purple-500/50 rounded-lg p-4 mt-4">
                        <p className="text-purple-300 font-semibold">📱 Team Leaders WhatsApp Group</p>
                        <p className="text-purple-200 text-sm mt-1">Check your WhatsApp for the group invitation link!</p>
                    </div>
                </div>
                <div className="space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row justify-center">
                    <button disabled className="home-button px-10 py-4 text-xl bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg font-bold transition-all duration-300 cursor-not-allowed opacity-60 relative">
                        <span className="line-through">Register a Team</span>
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">CLOSED</span>
                    </button>
                    <button disabled className="home-button px-10 py-4 text-xl bg-gradient-to-br from-gray-600 to-gray-700 rounded-lg font-bold transition-all duration-300 cursor-not-allowed opacity-60 relative">
                        <span className="line-through">Register as an Individual</span>
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">CLOSED</span>
                    </button>
                    <button onClick={() => setPage('registered')} className="home-button px-10 py-4 text-xl bg-gradient-to-br from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-lg font-bold transition-all duration-300 transform hover:scale-105 shadow-lg">View Registered Participants</button>
                </div>
            </div>
            <div className="py-20 animate-on-scroll">
                <h2 className="text-4xl font-bold text-center mb-12 text-cyan-300 fade-in-up">Next Steps & Updates</h2>
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center items-start gap-8 px-4">
                    <div className="text-center fade-in-up bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <div className="text-4xl mb-3">🎉</div>
                        <h3 className="text-xl font-bold text-emerald-400 mb-2">Round 1 Results</h3>
                        <p className="text-slate-300 mb-2">PPT Round Results</p>
                        <p className="text-emerald-300 font-semibold">NOW AVAILABLE!</p>
                    </div>
                    <div className="text-center fade-in-up bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <div className="text-4xl mb-3">📱</div>
                        <h3 className="text-xl font-bold text-purple-400 mb-2">WhatsApp Group</h3>
                        <p className="text-slate-300 mb-2">Team Leaders Only</p>
                        <p className="text-purple-300 font-semibold">Check your WhatsApp!</p>
                    </div>
                    <div className="text-center fade-in-up bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <div className="text-4xl mb-3">✅</div>
                        <h3 className="text-xl font-bold text-green-400 mb-2">Registration Status</h3>
                        <p className="text-slate-300 mb-2">All Registrations</p>
                        <p className="text-green-300 font-semibold">Closed Successfully</p>
                    </div>
                </div>
            </div>
            <div className="py-20 bg-slate-900/50 animate-on-scroll">
                <h2 className="text-4xl font-bold text-center mb-12 text-cyan-300 fade-in-up">Frequently Asked Questions</h2>
                <div className="max-w-3xl mx-auto space-y-4 px-4">
                    {FAQ_DATA.map((faq, index) => (
                        <div key={index} className="bg-slate-800 rounded-lg overflow-hidden fade-in-up">
                            <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="w-full text-left p-5 font-semibold text-lg flex justify-between items-center">
                                <span>{faq.q}</span>
                                <span className={`transform transition-transform duration-300 ${openFaq === index ? 'rotate-180' : ''}`}>▼</span>
                            </button>
                            <div className={`transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-96' : 'max-h-0'}`}>
                                <div className="p-5 border-t border-slate-700 text-slate-300">{faq.a}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="py-20 animate-on-scroll">
                <h2 className="text-4xl font-bold text-center mb-12 text-cyan-300 fade-in-up">Need Help?</h2>
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-center items-center gap-12 px-4">
                    <div className="text-center fade-in-up">
                        <p className="text-lg text-slate-300">Vikas Singh</p>
                        <p className="font-mono text-cyan-400 mt-1">+91 9039389755</p>
                        <a href="https://www.instagram.com/xvikasingh17" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 text-slate-400 hover:text-cyan-300"><InstagramIcon className="w-5 h-5" />xvikasingh17</a>
                    </div>
                    <div className="text-center fade-in-up">
                        <p className="text-lg text-slate-300">Gautam Jaiswani</p>
                        <p className="font-mono text-cyan-400 mt-1">+91 9131510118</p>
                        <a href="https://www.instagram.com/gautamjaiswani_" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 mt-2 text-slate-400 hover:text-cyan-300"><InstagramIcon className="w-5 h-5" />gautamjaiswani_</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

const MemberInput = ({ memberNumber, data, onChange }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-5 border-t border-gray-200 pt-5 mt-5">
        <h3 className="md:col-span-2 text-lg font-bold text-blue-900">Member {memberNumber}</h3>
        <input name="name" value={data.name} onChange={onChange} type="text" placeholder="Member Name" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
        <input name="year" value={data.year} onChange={onChange} type="text" placeholder="Year" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
        <input name="branch" value={data.branch} onChange={onChange} type="text" placeholder="Branch" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
        <input name="githubLink" value={data.githubLink} onChange={onChange} type="url" placeholder="GitHub Link (Optional)" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
        <input name="contactNumber" value={data.contactNumber} onChange={onChange} type="tel" placeholder="Contact Number" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
        <input name="instagram" value={data.instagram} onChange={onChange} type="text" placeholder="Instagram Username" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
        <div className="md:col-span-2 space-y-2">
            <label className="text-slate-700 font-semibold">Skills</label>
            <SkillsSelector selectedSkills={data.skills} onSkillsChange={(skills) => onChange({ target: { name: 'skills', value: skills } })} />
        </div>
        <input name="otherSkills" value={data.otherSkills} onChange={onChange} type="text" placeholder="Other skills (comma-separated)" className="md:col-span-2 bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
    </div>
);

export const TeamRegistration = ({ setPage, setTeams, showToast, showAlert }) => {
    const initialMemberState = { name: '', year: '', branch: '', githubLink: '', skills: [], contactNumber: '', instagram: '', otherSkills: '' };
    const [formData, setFormData] = useState({
        teamName: '',
        leader: { name: '', year: '1st Year', branch: 'CSE', githubLink: '', contactNumber: '' },
        members: Array(5).fill(null).map(() => ({ ...initialMemberState })),
        leaderContact: { discord: '' },
        problemStatement: ''
    });
    const [loading, setLoading] = useState(false);

    const handleLeaderChange = (e) => setFormData(prev => ({ ...prev, leader: { ...prev.leader, [e.target.name]: e.target.value } }));
    const handleMemberChange = (index, e) => {
        const { name, value } = e.target;
        const updatedMembers = [...formData.members];
        updatedMembers[index][name] = value;
        setFormData(prev => ({ ...prev, members: updatedMembers }));
    };
    const handleContactChange = (e) => setFormData(prev => ({ ...prev, leaderContact: { ...prev.leaderContact, [e.target.name]: e.target.value } }));

    const registerTeam = async (teamData) => {
        setLoading(true);
        try {
            const response = await fetch('/api/register/team', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(teamData),
            });
            const result = await response.json();
            if (!response.ok) throw new Error(result.message || 'Registration failed');
            setTeams(prev => [...prev, result]);
            showToast('Team registration successful!');
            if (window.confetti) window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            setTimeout(() => setPage('registered'), 2000);
        } catch (error) {
            console.error("Failed to register team:", error);
            showAlert(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!formData.teamName || !formData.leader.name || !formData.leader.contactNumber) {
            showAlert("Please fill in all required fields for the team and leader.");
            return;
        }
        const finalData = { ...formData, leaderContact: { ...formData.leaderContact, phone: formData.leader.contactNumber } };
        registerTeam(finalData);
    };

    return (
        <div className="flex-grow text-slate-800 pb-20">
            <AnnouncementBanner />
            <div className="p-4 md:p-8">
                <h2 className="text-4xl font-bold text-center mb-8 text-blue-900">Team Registration Form</h2>

                <form className="max-w-4xl mx-auto bg-white shadow-xl p-6 md:p-8 rounded-2xl border border-gray-200 space-y-6 relative">

                    <input type="text" value={formData.teamName} onChange={(e) => setFormData({ ...formData, teamName: e.target.value })} placeholder="Team Name" required className="w-full bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition text-xl font-bold" />
                    <textarea name="problemStatement" value={formData.problemStatement} onChange={(e) => setFormData({ ...formData, problemStatement: e.target.value })} placeholder="Problem Statement (Optional)" className="w-full h-24 bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-gray-200 pt-5">
                        <h3 className="md:col-span-2 text-xl font-bold text-blue-900 border-b border-gray-200 pb-2">Team Leader</h3>
                        <input name="name" value={formData.leader.name} onChange={handleLeaderChange} type="text" placeholder="Leader's Name" required className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                        <input name="year" value={formData.leader.year} onChange={handleLeaderChange} type="text" placeholder="Year" required className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                        <input name="branch" value={formData.leader.branch} onChange={handleLeaderChange} type="text" placeholder="Branch" required className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                        <input name="githubLink" value={formData.leader.githubLink} onChange={handleLeaderChange} type="url" placeholder="GitHub Link (Optional)" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                        <input name="contactNumber" value={formData.leader.contactNumber} onChange={handleLeaderChange} type="tel" placeholder="Leader Contact Number" required className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                        <input name="discord" value={formData.leaderContact.discord} onChange={handleContactChange} type="text" placeholder="Leader Discord ID (Optional)" className="bg-gray-50 border border-gray-300 text-slate-800 p-3 rounded-md focus:ring-2 focus:ring-orange-500 outline-none transition" />
                    </div>
                    {formData.members.map((member, i) => <MemberInput key={i} memberNumber={i + 1} data={member} onChange={(e) => handleMemberChange(i, e)} />)}
                </form>
            </div>
        </div>
    );
};

export const IndividualRegistration = ({ setPage, setIndividuals, showToast, showAlert }) => {
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

            showToast('Individual registration successful!');
            if (window.confetti) window.confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 } });
            setTimeout(() => setPage('registered'), 2000);
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

const RegisteredPage = ({ teams, individuals }) => {
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [contactInfo, setContactInfo] = useState(null);

    const handleContactClick = (individual) => {
        if (individual.discord || individual.instagram || individual.contactNumber) {
            setContactInfo(individual);
        } else {
            setContactInfo({ ...individual, unavailable: true });
        }
    };

    const closeModal = () => {
        setSelectedTeam(null);
        setContactInfo(null);
    };

    return (
        <div className="flex-grow p-4 md:p-8 text-white">
            <h2 className="text-4xl font-bold text-center mb-10 text-cyan-300">Registered Participants</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                <div className="panel">
                    <h3 className="text-3xl font-bold mb-6 text-center text-cyan-400">Teams ({teams.length})</h3>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {teams.length > 0 ? teams.map(team => (
                            <div key={team._id} onClick={() => setSelectedTeam(team)} className="bg-slate-800/50 border border-slate-700 rounded-lg p-5 cursor-pointer transition-all duration-300 hover:bg-slate-800 hover:border-cyan-500 hover:shadow-cyan-500/10 hover:shadow-lg transform hover:-translate-y-1">
                                <h4 className="text-xl font-bold text-cyan-300">{team.teamName}</h4>
                                <p className="text-slate-300">Leader: {team.leader.name}</p>
                                <p className="text-sm text-slate-400 mt-1">{team.members.filter(m => m.name).length} member{team.members.filter(m => m.name).length !== 1 && 's'}</p>
                            </div>
                        )) : <p className="text-center text-slate-500 py-8">No teams have registered yet.</p>}
                    </div>
                </div>
                <div className="panel">
                    <h3 className="text-3xl font-bold mb-6 text-center text-teal-300">Individuals ({individuals.length})</h3>
                    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                        {individuals.length > 0 ? individuals.map(ind => (
                            <div key={ind._id} className="bg-slate-800/50 border border-slate-700 rounded-lg p-5">
                                <h4 className="text-xl font-bold text-teal-200">{ind.name}</h4>
                                <p className="text-slate-300">{ind.branch} - {ind.year}</p>
                                <div className="flex flex-wrap gap-2 my-3">
                                    {[...ind.skills, ...(ind.otherSkills ? ind.otherSkills.split(',').map(s => s.trim()) : [])].slice(0, 5).map(skill => (
                                        <span key={skill} className="bg-slate-700 text-cyan-200 text-xs font-medium px-2.5 py-1 rounded-full">{skill}</span>
                                    ))}
                                </div>
                                <div className="border-t border-slate-700 pt-3 mt-3 flex justify-end">
                                    <button onClick={() => handleContactClick(ind)} className="bg-teal-600 hover:bg-teal-500 px-5 py-2 rounded-lg font-semibold transition-transform transform hover:scale-105 text-sm">View Contact</button>
                                </div>
                            </div>
                        )) : <p className="text-center text-slate-500 py-8">No individuals have registered yet.</p>}
                    </div>
                </div>
            </div>
            <TeamDetailsModal team={selectedTeam} onClose={closeModal} />
            <ContactModal individual={contactInfo} onClose={closeModal} />
        </div>
    );
};

// --- Modals and Helper Components ---

const TeamDetailsModal = ({ team, onClose }) => {
    if (!team) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full text-left max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="p-6 md:p-8 sticky top-0 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700">
                    <h2 className="text-2xl md:text-3xl font-bold text-cyan-300">{team.teamName}</h2>
                    {team.problemStatement && <p className="text-slate-300 mt-2">{team.problemStatement}</p>}
                </div>
                <div className="p-6 md:p-8 space-y-6">
                    <div>
                        <h3 className="text-xl font-semibold text-cyan-400 mb-3 border-b border-slate-700 pb-2">Team Leader</h3>
                        <p><strong>{team.leader.name}</strong> ({team.leader.branch} - {team.leader.year})</p>
                        <p className="text-sm text-slate-400">Contact: {team.leader.contactNumber}</p>
                    </div>
                    {team.members.filter(m => m.name).length > 0 && (
                        <div>
                            <h3 className="text-xl font-semibold text-cyan-400 mb-3 border-b border-slate-700 pb-2">Members</h3>
                            <div className="space-y-4">
                                {team.members.filter(m => m.name).map((member, index) => (
                                    <div key={index} className="bg-slate-700/50 p-4 rounded-lg">
                                        <p><strong>{member.name}</strong> ({member.branch} - {member.year})</p>
                                        <p className="text-sm text-slate-400">Contact: {member.contactNumber} / Insta: @{member.instagram}</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {[...member.skills, ...(member.otherSkills ? member.otherSkills.split(',').map(s => s.trim()) : [])].map(skill => (
                                                <span key={skill} className="bg-slate-600 text-cyan-200 text-xs font-medium px-2 py-0.5 rounded-full">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-slate-800/50 border-t border-slate-700 sticky bottom-0 flex justify-end">
                    <button onClick={onClose} className="bg-slate-600 hover:bg-slate-500 px-8 py-2 rounded-lg font-semibold">Close</button>
                </div>
            </div>
        </div>
    );
};

const ContactModal = ({ individual, onClose }) => {
    if (!individual) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 border border-slate-700 p-8 rounded-xl shadow-2xl w-full max-w-sm text-center" onClick={e => e.stopPropagation()}>
                {individual.unavailable ? (
                    <><h3 className="text-2xl font-bold text-orange-400 mb-4">Contact Info Private</h3><p className="text-lg">{individual.name} has not provided public contact details.</p></>
                ) : (
                    <><h3 className="text-2xl font-bold text-cyan-300 mb-6">Contact {individual.name}</h3><div className="space-y-3 text-left">
                        {individual.contactNumber && <p className="text-lg">📞 <span className="font-mono">{individual.contactNumber}</span></p>}
                        {individual.instagram && <p className="text-lg">📷 <span className="font-mono">@{individual.instagram}</span></p>}
                        {individual.discord && <p className="text-lg">💬 <span className="font-mono">{individual.discord}</span></p>}
                    </div></>
                )}
                <button onClick={onClose} className="mt-8 bg-slate-600 hover:bg-slate-500 px-8 py-2 rounded-lg font-semibold">Close</button>
            </div>
        </div>
    );
};

const AlertModal = ({ message, show, onClose }) => {
    if (!show) return null;
    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-red-500/50 p-8 rounded-xl shadow-2xl w-full max-w-sm text-center">
                <h3 className="text-2xl font-bold text-red-400 mb-4">Alert</h3>
                <p className="text-lg text-slate-300">{message}</p>
                <button onClick={onClose} className="mt-6 bg-red-600 hover:bg-red-500 px-8 py-2 rounded-lg font-semibold">Close</button>
            </div>
        </div>
    );
};

export default function App() {
    const [page, setPage] = useState('home');
    const [teams, setTeams] = useState([]);
    const [individuals, setIndividuals] = useState([]);
    const [toast, setToast] = useState({ show: false, message: '' });
    const [alert, setAlert] = useState({ show: false, message: '' });
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [teamsRes, individualsRes] = await Promise.all([
                    fetch('/api/teams'),
                    fetch('/api/individuals')
                ]);
                if (!teamsRes.ok || !individualsRes.ok) throw new Error('Network response was not ok');
                const teamsData = await teamsRes.json();
                const individualsData = await individualsRes.json();
                setTeams(teamsData);
                setIndividuals(individualsData);
            } catch (error) {
                console.error("Failed to fetch registered participants:", error);
                showAlert("Could not load participant data.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllData();
    }, []);

    const showToast = (message) => {
        setToast({ show: true, message });
        setTimeout(() => setToast({ show: false, message: '' }), 3000);
    };

    const showAlert = (message) => setAlert({ show: true, message });
    const closeAlert = () => setAlert({ show: false, message: '' });

    const handleNav = (targetPage) => {
        setPage(targetPage);
        setIsMenuOpen(false);
    }

    const renderPage = () => {
        if (isLoading && page === 'registered') {
            return <div className="text-center text-slate-400 py-10 flex-grow">Loading participants...</div>;
        }

        switch (page) {
            case 'team':
                // Team registration is now closed, redirect to home
                setPage('home');
                showAlert('Team registration has been closed. Results will be announced on Monday, 15th September 2025.');
                return <HomePage setPage={setPage} />;
            case 'individual':
                // Individual registration is now closed, redirect to home
                setPage('home');
                showAlert('Individual registration has been closed. Only team registrations were accepted, which are also now closed.');
                return <HomePage setPage={setPage} />;
            case 'registered': return <RegisteredPage teams={teams} individuals={individuals} />;
            default: return <HomePage setPage={setPage} />;
        }
    };

    return (
        <div className="bg-slate-900 min-h-screen flex flex-col font-sans relative overflow-x-hidden">
            {/* Epic Multi-Layer Animated Background */}
            <EpicBackground />
            {/* Enhanced Multi-layer Animated Background */}
            <div className="absolute top-0 left-0 w-full h-full bg-grid-slate-800 opacity-80"></div>

            {/* Floating Orbs Layer 1 */}
            <div className="absolute top-0 left-[-15rem] w-[50rem] h-[50rem] bg-gradient-to-br from-cyan-500/15 to-blue-500/10 rounded-full blur-3xl animate-float-slow"></div>
            <div className="absolute bottom-0 right-[-15rem] w-[50rem] h-[50rem] bg-gradient-to-br from-purple-500/15 to-pink-500/10 rounded-full blur-3xl animate-float-slow animation-delay-2000"></div>

            {/* Floating Orbs Layer 2 - Medium */}
            <div className="absolute top-1/4 right-[-10rem] w-[35rem] h-[35rem] bg-gradient-to-br from-emerald-500/12 to-teal-500/8 rounded-full blur-2xl animate-float-medium animation-delay-4000"></div>
            <div className="absolute bottom-1/4 left-[-10rem] w-[35rem] h-[35rem] bg-gradient-to-br from-orange-500/12 to-red-500/8 rounded-full blur-2xl animate-float-medium animation-delay-6000"></div>

            {/* Floating Orbs Layer 3 - Small */}
            <div className="absolute top-1/2 left-1/4 w-[20rem] h-[20rem] bg-gradient-to-br from-violet-500/10 to-indigo-500/6 rounded-full blur-xl animate-float-fast animation-delay-1000"></div>
            <div className="absolute bottom-1/3 right-1/4 w-[25rem] h-[25rem] bg-gradient-to-br from-lime-500/10 to-green-500/6 rounded-full blur-xl animate-float-fast animation-delay-3000"></div>

            {/* Particle Stars */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/4 left-1/5 w-2 h-2 bg-cyan-400 rounded-full animate-twinkle animation-delay-500"></div>
                <div className="absolute top-1/3 right-1/5 w-1 h-1 bg-purple-400 rounded-full animate-twinkle animation-delay-1500"></div>
                <div className="absolute bottom-1/4 left-1/3 w-1.5 h-1.5 bg-pink-400 rounded-full animate-twinkle animation-delay-2500"></div>
                <div className="absolute bottom-1/3 right-1/3 w-1 h-1 bg-emerald-400 rounded-full animate-twinkle animation-delay-3500"></div>
                <div className="absolute top-2/3 left-2/3 w-2 h-2 bg-orange-400 rounded-full animate-twinkle animation-delay-4500"></div>
                <div className="absolute top-1/6 right-2/3 w-1 h-1 bg-blue-400 rounded-full animate-twinkle animation-delay-5500"></div>
            </div>

            {/* Gradient Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900/30 via-transparent to-slate-900/50 pointer-events-none"></div>

            <nav className="sticky top-0 p-4 bg-slate-900/80 md:backdrop-blur-lg z-20 border-b border-slate-800">
                <div className="container mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        {page !== 'home' && (
                            <button onClick={() => setPage('home')} className="text-white p-1 rounded-full hover:bg-slate-700"><BackArrowIcon className="w-6 h-6" /></button>
                        )}
                        <div onClick={() => setPage('home')} className="text-2xl font-bold text-white cursor-pointer">SIH <span className="text-cyan-400">LNCTU</span></div>
                    </div>

                    <div className="hidden md:flex space-x-2">
                        {['home', 'registered'].map(p => (
                            <button key={p} onClick={() => handleNav(p)} className={`capitalize px-4 py-2 rounded-md transition-colors ${page === p ? 'bg-cyan-600 text-white' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'}`}>{p === 'registered' ? 'Registered' : 'Home'}</button>
                        ))}
                        <button disabled className="capitalize px-4 py-2 rounded-md transition-colors cursor-not-allowed opacity-50 text-slate-500 relative">
                            Teams
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full text-[10px]">✕</span>
                        </button>
                        <button disabled className="capitalize px-4 py-2 rounded-md transition-colors cursor-not-allowed opacity-50 text-slate-500 relative">
                            Individuals
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full text-[10px]">✕</span>
                        </button>
                    </div>

                    <div className="md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-white">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            <div className={`fixed top-0 left-0 w-full h-full bg-slate-900 z-50 transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:hidden`}>
                <div className="flex flex-col items-center justify-center h-full space-y-8">
                    {['home', 'registered'].map(p => (
                        <button key={p} onClick={() => { handleNav(p); setIsMenuOpen(false); }} className={`text-3xl capitalize font-bold transition-colors ${page === p ? 'text-cyan-400' : 'text-white hover:text-cyan-300'}`}>
                            {p === 'registered' ? 'Registered' : 'Home'}
                        </button>
                    ))}
                    <div className="text-3xl capitalize font-bold text-gray-500 opacity-50 line-through relative">
                        Teams
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">CLOSED</span>
                    </div>
                    <div className="text-3xl capitalize font-bold text-gray-500 opacity-50 line-through relative">
                        Individuals
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-sm px-2 py-1 rounded-full">CLOSED</span>
                    </div>
                </div>
            </div>

            <main className="container mx-auto flex-grow flex flex-col z-10">{renderPage()}</main>

            <Footer />

            <AlertModal message={alert.message} show={alert.show} onClose={closeAlert} />

            {toast.show && (
                <div className="fixed bottom-5 right-5 bg-green-600 text-white py-3 px-6 rounded-lg shadow-lg z-50">
                    {toast.message}
                </div>
            )}

            <style>{`
            .bg-grid-slate-800 { 
                background-image: 
                    linear-gradient(rgba(255, 255, 255, 0.07) 1px, transparent 1px), 
                    linear-gradient(90deg, rgba(255, 255, 255, 0.07) 1px, transparent 1px); 
                background-size: 2rem 2rem;
                animation: grid-move 20s linear infinite;
            }
            
            @keyframes grid-move {
                0% { transform: translate(0, 0); }
                100% { transform: translate(2rem, 2rem); }
            }
            
            @keyframes float-slow {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                25% { transform: translate(20px, -30px) rotate(90deg); }
                50% { transform: translate(-15px, -20px) rotate(180deg); }
                75% { transform: translate(-25px, 15px) rotate(270deg); }
            }
            
            @keyframes float-medium {
                0%, 100% { transform: translate(0, 0) rotate(0deg) scale(1); }
                33% { transform: translate(30px, -20px) rotate(120deg) scale(1.1); }
                66% { transform: translate(-20px, 25px) rotate(240deg) scale(0.9); }
            }
            
            @keyframes float-fast {
                0%, 100% { transform: translate(0, 0) rotate(0deg); }
                20% { transform: translate(15px, -25px) rotate(72deg); }
                40% { transform: translate(-10px, -15px) rotate(144deg); }
                60% { transform: translate(-20px, 10px) rotate(216deg); }
                80% { transform: translate(25px, 20px) rotate(288deg); }
            }
            
            @keyframes twinkle {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50% { opacity: 1; transform: scale(1.2); }
            }
            
            .animate-float-slow { animation: float-slow 12s ease-in-out infinite; }
            .animate-float-medium { animation: float-medium 8s ease-in-out infinite; }
            .animate-float-fast { animation: float-fast 6s ease-in-out infinite; }
            .animate-twinkle { animation: twinkle 3s ease-in-out infinite; }
            
            .animation-delay-1000 { animation-delay: 1s; }
            .animation-delay-2000 { animation-delay: 2s; }
            .animation-delay-3000 { animation-delay: 3s; }
            .animation-delay-4000 { animation-delay: 4s; }
            .animation-delay-5000 { animation-delay: 5s; }
            .animation-delay-6000 { animation-delay: 6s; }
            .animation-delay-500 { animation-delay: 0.5s; }
            .animation-delay-1500 { animation-delay: 1.5s; }
            .animation-delay-2500 { animation-delay: 2.5s; }
            .animation-delay-3500 { animation-delay: 3.5s; }
            .animation-delay-4500 { animation-delay: 4.5s; }
            .animation-delay-5500 { animation-delay: 5.5s; }
            
            .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
            @keyframes pulse { 50% { opacity: .5; } }
            
            .panel .overflow-y-auto::-webkit-scrollbar { width: 6px; }
            .panel .overflow-y-auto::-webkit-scrollbar-track { background: transparent; }
            .panel .overflow-y-auto::-webkit-scrollbar-thumb { background-color: rgba(134, 239, 172, 0.3); border-radius: 20px; border: 3px solid transparent; }
            .panel .overflow-y-auto::-webkit-scrollbar-thumb:hover { background-color: rgba(134, 239, 172, 0.5); }
            
            @keyframes scroll-x { from { transform: translateX(0); } to { transform: translateX(-50%); } }
            .animate-scroll-x { animation: scroll-x 40s linear infinite; }
            .group:hover .animate-scroll-x { animation-play-state: paused; }
            
            @keyframes marquee { 0% { transform: translateX(100%); } 100% { transform: translateX(-100%); } }
            .animate-marquee { animation: marquee 20s linear infinite; }
        `}</style>
        </div>
    );
}

const Footer = () => (
    <footer className="text-center py-6 bg-transparent text-slate-400 mt-auto z-10">
        <p>Developed by Gautam Jaiswani & Vikas Singh</p>
    </footer>
);

