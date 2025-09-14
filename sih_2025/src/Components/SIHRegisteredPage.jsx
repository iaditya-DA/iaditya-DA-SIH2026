import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Team Details Modal
const TeamDetailsModal = ({ team, onClose }) => {
  if (!team) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 border border-slate-700 rounded-3xl shadow-2xl max-w-4xl w-full text-left max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 md:p-8 sticky top-0 bg-slate-800/80 backdrop-blur-lg border-b border-slate-700 rounded-t-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-cyan-300">{team.teamName}</h2>
            {team.problemStatement && <p className="text-slate-300 mt-2">{team.problemStatement}</p>}
          </div>
          
          <div className="p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-cyan-400 mb-4 border-b border-slate-700 pb-2">Team Leader</h3>
              <div className="bg-slate-700/50 p-4 rounded-xl">
                <p className="text-lg"><strong className="text-white">{team.leader.name}</strong></p>
                <p className="text-slate-300">({team.leader.branch} - {team.leader.year})</p>
                <p className="text-sm text-slate-400 mt-1">Contact: {team.leader.contactNumber}</p>
                {team.leader.githubLink && (
                  <p className="text-sm text-slate-400">GitHub: {team.leader.githubLink}</p>
                )}
              </div>
            </div>
            
            {team.members.filter(m => m.name).length > 0 && (
              <div>
                <h3 className="text-xl font-semibold text-cyan-400 mb-4 border-b border-slate-700 pb-2">Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.members.filter(m => m.name).map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-slate-700/50 p-4 rounded-xl"
                    >
                      <p className="text-lg"><strong className="text-white">{member.name}</strong></p>
                      <p className="text-slate-300">({member.branch} - {member.year})</p>
                      <p className="text-sm text-slate-400 mt-1">📞 {member.contactNumber}</p>
                      {member.instagram && (
                        <p className="text-sm text-slate-400">📷 @{member.instagram}</p>
                      )}
                      {member.githubLink && (
                        <p className="text-sm text-slate-400">🔗 GitHub</p>
                      )}
                      
                      <div className="flex flex-wrap gap-1 mt-3">
                        {[...member.skills, ...(member.otherSkills ? member.otherSkills.split(',').map(s=>s.trim()) : [])].map(skill => (
                          <span key={skill} className="bg-slate-600 text-cyan-200 text-xs font-medium px-2 py-1 rounded-full">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 bg-slate-800/50 border-t border-slate-700 sticky bottom-0 flex justify-end rounded-b-3xl">
            <motion.button
              onClick={onClose}
              className="bg-slate-600 hover:bg-slate-500 px-8 py-3 rounded-2xl font-semibold transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Close
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Contact Modal
const ContactModal = ({ individual, onClose }) => {
  if (!individual) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-slate-800 border border-slate-700 p-8 rounded-3xl shadow-2xl w-full max-w-md text-center"
          onClick={e => e.stopPropagation()}
        >
          {individual.unavailable ? (
            <>
              <h3 className="text-2xl font-bold text-orange-400 mb-4">Contact Info Private</h3>
              <p className="text-lg text-slate-300">{individual.name} has not provided public contact details.</p>
            </>
          ) : (
            <>
              <h3 className="text-2xl font-bold text-cyan-300 mb-6">Contact {individual.name}</h3>
              <div className="space-y-4 text-left">
                {individual.contactNumber && (
                  <p className="text-lg flex items-center gap-3">
                    <span>📞</span>
                    <span className="font-mono">{individual.contactNumber}</span>
                  </p>
                )}
                {individual.instagram && (
                  <p className="text-lg flex items-center gap-3">
                    <span>📷</span>
                    <span className="font-mono">@{individual.instagram}</span>
                  </p>
                )}
                {individual.discord && (
                  <p className="text-lg flex items-center gap-3">
                    <span>💬</span>
                    <span className="font-mono">{individual.discord}</span>
                  </p>
                )}
                {individual.github && (
                  <p className="text-lg flex items-center gap-3">
                    <span>🔗</span>
                    <span className="font-mono">GitHub</span>
                  </p>
                )}
              </div>
            </>
          )}
          
          <motion.button
            onClick={onClose}
            className="mt-8 bg-slate-600 hover:bg-slate-500 px-8 py-3 rounded-2xl font-semibold transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Close
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Main SIH Registered Page Component
const SIHRegisteredPage = ({ teams, individuals, isLoading }) => {
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [contactInfo, setContactInfo] = useState(null);
  
  const handleContactClick = (individual) => {
    if (individual.discord || individual.instagram || individual.contactNumber || individual.github) {
      setContactInfo(individual);
    } else {
      setContactInfo({ ...individual, unavailable: true });
    }
  };
  
  const closeModal = () => {
    setSelectedTeam(null);
    setContactInfo(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xl text-slate-400">Loading participants...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-32 pb-20">
      {/* Professional Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Floating User Icons */}
        <motion.div
          className="absolute top-20 left-10"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-cyan-500/30">
            <svg className="w-8 h-8 text-cyan-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 right-10"
          animate={{ y: [0, 15, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center border border-purple-500/30">
            <svg className="w-10 h-10 text-purple-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
            </svg>
          </div>
        </motion.div>
        
        <motion.div
          className="absolute top-1/2 right-1/4"
          animate={{ y: [0, -10, 0], x: [0, 10, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          <div className="w-12 h-12 bg-gradient-to-br from-emerald-500/20 to-green-500/20 rounded-full flex items-center justify-center border border-emerald-500/30">
            <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-7xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">
            Registered Participants
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Teams Section */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-slate-800/50 rounded-3xl border border-slate-700 p-8 h-full backdrop-blur-sm">
                <h3 className="text-3xl font-bold mb-8 text-center text-cyan-400 flex items-center justify-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                  </svg>
                  Teams ({teams.length})
                </h3>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  {teams.length > 0 ? (
                    teams.map((team, index) => (
                      <motion.div
                        key={team._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        onClick={() => setSelectedTeam(team)}
                        className="bg-slate-700/50 border border-slate-600 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:bg-slate-700 hover:border-cyan-500 hover:shadow-cyan-500/10 hover:shadow-lg"
                        whileHover={{ scale: 1.02, y: -3 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <h4 className="text-xl font-bold text-cyan-300 mb-2">{team.teamName}</h4>
                        <p className="text-slate-300 mb-1">Leader: {team.leader.name}</p>
                        <p className="text-sm text-slate-400">
                          {team.members.filter(m => m.name).length} member{team.members.filter(m => m.name).length !== 1 ? 's' : ''}
                        </p>
                        {team.problemStatement && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                            {team.problemStatement.substring(0, 100)}...
                          </p>
                        )}
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500 text-lg">No teams have registered yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Individuals Section */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-slate-800/50 rounded-3xl border border-slate-700 p-8 h-full backdrop-blur-sm">
                <h3 className="text-3xl font-bold mb-8 text-center text-emerald-400 flex items-center justify-center gap-3">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                  </svg>
                  Individuals ({individuals.length})
                </h3>
                
                <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
                  {individuals.length > 0 ? (
                    individuals.map((individual, index) => (
                      <motion.div
                        key={individual._id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="bg-slate-700/50 border border-slate-600 rounded-2xl p-6 transition-all duration-300 hover:bg-slate-700 hover:border-emerald-500"
                        whileHover={{ scale: 1.02, y: -3 }}
                      >
                        <h4 className="text-xl font-bold text-emerald-300 mb-2">{individual.name}</h4>
                        <p className="text-slate-300 mb-3">{individual.branch} - {individual.year}</p>
                        
                        <div className="flex flex-wrap gap-2 mb-4">
                          {[...individual.skills, ...(individual.otherSkills ? individual.otherSkills.split(',').map(s=>s.trim()) : [])].slice(0, 5).map(skill => (
                            <span key={skill} className="bg-slate-600 text-emerald-200 text-xs font-medium px-2.5 py-1 rounded-full">
                              {skill}
                            </span>
                          ))}
                        </div>
                        
                        {individual.hasDeployed && individual.productLink && (
                          <div className="mb-3">
                            <span className="text-xs bg-emerald-500/20 text-emerald-300 px-2 py-1 rounded-full">
                              💻 Has Deployed Projects
                            </span>
                          </div>
                        )}
                        
                        <div className="border-t border-slate-600 pt-4 flex justify-end">
                          <motion.button
                            onClick={() => handleContactClick(individual)}
                            className="bg-emerald-600 hover:bg-emerald-500 px-6 py-2 rounded-xl font-semibold text-sm transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            View Contact
                          </motion.button>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500 text-lg">No individuals have registered yet.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Modals */}
      {selectedTeam && <TeamDetailsModal team={selectedTeam} onClose={closeModal} />}
      {contactInfo && <ContactModal individual={contactInfo} onClose={closeModal} />}
    </div>
  );
};

export default SIHRegisteredPage;