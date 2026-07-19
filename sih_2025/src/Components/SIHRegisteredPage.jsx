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
          className="bg-white border border-gray-200 rounded-3xl shadow-2xl max-w-4xl w-full text-left max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 md:p-8 sticky top-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 rounded-t-3xl">
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900">{team.teamName}</h2>
            {team.problemStatement && <p className="text-slate-600 mt-2">{team.problemStatement}</p>}
          </div>

          <div className="p-6 md:p-8 space-y-8">
            <div>
              <h3 className="text-xl font-bold text-blue-800 mb-4 border-b border-gray-200 pb-2">Team Leader</h3>
              <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl">
                <p className="text-lg"><strong className="text-slate-800">{team.leader.name}</strong></p>
                <p className="text-slate-600">({team.leader.branch} - {team.leader.year})</p>
                <p className="text-sm text-slate-500 mt-1">Contact: {team.leader.contactNumber}</p>
                {team.leader.githubLink && (
                  <p className="text-sm text-slate-500">GitHub: {team.leader.githubLink}</p>
                )}
              </div>
            </div>

            {team.members.filter(m => m.name).length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-blue-800 mb-4 border-b border-gray-200 pb-2">Members</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {team.members.filter(m => m.name).map((member, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-gray-50 border border-gray-200 p-4 rounded-xl"
                    >
                      <p className="text-lg"><strong className="text-slate-800">{member.name}</strong></p>
                      <p className="text-slate-600">({member.branch} - {member.year})</p>
                      <p className="text-sm text-slate-500 mt-1">📞 {member.contactNumber}</p>
                      {member.instagram && (
                        <p className="text-sm text-slate-500">📷 @{member.instagram}</p>
                      )}
                      {member.githubLink && (
                        <p className="text-sm text-slate-500">🔗 GitHub</p>
                      )}

                      <div className="flex flex-wrap gap-1 mt-3">
                        {[...member.skills, ...(member.otherSkills ? member.otherSkills.split(',').map(s => s.trim()) : [])].map(skill => (
                          <span key={skill} className="bg-gray-200 text-blue-900 border border-gray-300 text-xs font-bold px-2 py-1 rounded-full">
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

          <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 flex justify-end rounded-b-3xl">
            <motion.button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-slate-800 px-8 py-3 rounded-2xl font-bold transition-colors shadow-sm"
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

// Individual Full Detail Modal (profile + contact, combined)
const IndividualDetailModal = ({ individual, teamName, onClose }) => {
  if (!individual) return null;

  const allSkills = [
    ...(individual.skills || []),
    ...(individual.otherSkills ? individual.otherSkills.split(',').map(s => s.trim()).filter(Boolean) : []),
  ];

  const hasAnyContact =
    individual.contactNumber || individual.instagram || individual.discord || individual.github;

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
          className="bg-white border border-gray-200 rounded-3xl shadow-2xl max-w-lg w-full text-left max-h-[90vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-6 md:p-8 sticky top-0 bg-white/90 backdrop-blur-lg border-b border-gray-200 rounded-t-3xl flex items-center justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-blue-900">{individual.name}</h2>
              <p className="text-slate-600 mt-1">{individual.branch} - {individual.year}</p>
            </div>
            {individual.teamId && (
              <span className="bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap">
                {teamName ? `Team: ${teamName}` : 'In a team'}
              </span>
            )}
          </div>

          <div className="p-6 md:p-8 space-y-6">
            {allSkills.length > 0 && (
              <div>
                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wide mb-3">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {allSkills.map(skill => (
                    <span key={skill} className="bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold px-2.5 py-1 rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {individual.hasDeployed && individual.productLink && (
              <div>
                <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wide mb-3">Deployed Project</h3>
                <span className="text-xs bg-green-50 border border-green-200 text-green-700 font-bold px-2 py-1 rounded-full">
                  💻 {individual.productLink}
                </span>
              </div>
            )}

            <div>
              <h3 className="text-sm font-bold text-orange-500 uppercase tracking-wide mb-3">Contact</h3>
              {hasAnyContact ? (
                <div className="space-y-3 text-slate-800 bg-gray-50 border border-gray-200 rounded-xl p-4">
                  {individual.contactNumber && (
                    <p className="flex items-center gap-3">
                      <span>📞</span>
                      <span className="font-mono font-semibold">{individual.contactNumber}</span>
                    </p>
                  )}
                  {individual.instagram && (
                    <p className="flex items-center gap-3">
                      <span>📷</span>
                      <span className="font-mono font-semibold">@{individual.instagram}</span>
                    </p>
                  )}
                  {individual.discord && (
                    <p className="flex items-center gap-3">
                      <span>💬</span>
                      <span className="font-mono font-semibold">{individual.discord}</span>
                    </p>
                  )}
                  {individual.github && (
                    <p className="flex items-center gap-3">
                      <span>🔗</span>
                      <span className="font-mono font-semibold">{individual.github}</span>
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-slate-500">This participant hasn't provided public contact details.</p>
              )}
            </div>
          </div>

          <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 flex justify-end rounded-b-3xl">
            <motion.button
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-slate-800 px-8 py-3 rounded-2xl font-bold transition-colors shadow-sm"
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

// Compact row-card shown inside the expanded list
const TeamRowCard = ({ team, index, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    onClick={onClick}
    className="flex items-center gap-4 bg-white border border-orange-200 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md"
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
  >
    <div className="w-11 h-11 rounded-xl border-2 border-orange-400 bg-orange-50 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
        <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
      </svg>
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-bold text-blue-900 truncate">{team.teamName}</p>
      <p className="text-sm text-slate-500 truncate">Leader: {team.leader?.name}</p>
    </div>
    <span className="text-xs font-semibold bg-orange-50 border border-orange-200 text-orange-600 rounded-full px-3 py-1 flex-shrink-0">
      {(team.members?.filter(m => m.name).length || 0) + 1} members
    </span>
  </motion.div>
);

const IndividualRowCard = ({ individual, index, teamName, onClick }) => (
  <motion.div
    initial={{ opacity: 0, y: 15 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ delay: index * 0.05, duration: 0.3 }}
    onClick={onClick}
    className="flex items-center gap-4 bg-white border border-orange-200 rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:-translate-y-0.5 hover:border-orange-400 hover:shadow-md"
    whileHover={{ scale: 1.01 }}
    whileTap={{ scale: 0.99 }}
  >
    <div className="w-11 h-11 rounded-xl border-2 border-orange-400 bg-orange-50 flex items-center justify-center flex-shrink-0">
      <svg className="w-5 h-5 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
      </svg>
    </div>
    <div className="min-w-0 flex-1">
      <p className="font-bold text-blue-900 truncate">{individual.name}</p>
      <p className="text-sm text-slate-500 truncate">{individual.branch} - {individual.year}</p>
    </div>
    {individual.teamId && (
      <span className="text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-800 rounded-full px-3 py-1 flex-shrink-0 max-w-[45%] truncate">
        {teamName ? `Team: ${teamName}` : 'In a team'}
      </span>
    )}
  </motion.div>
);

// Main SIH Registered Page Component
const SIHRegisteredPage = ({ teams, individuals, isLoading }) => {
  const [activeSection, setActiveSection] = useState(null); // 'teams' | 'individuals' | null
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedIndividual, setSelectedIndividual] = useState(null);

  const toggleSection = (section) => {
    setActiveSection(prev => (prev === section ? null : section));
  };

  const closeModal = () => {
    setSelectedTeam(null);
    setSelectedIndividual(null);
  };

  // Map of teamId -> teamName so individuals who belong to a team can show its name
  const teamNameById = (teams || []).reduce((acc, team) => {
    const id = team.id || team._id;
    if (id) acc[id] = team.teamName;
    return acc;
  }, {});

  if (isLoading) {
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
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-xl text-slate-400">Loading participants...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 text-blue-900">
            Registered Participants
          </h2>

          {/* Two summary cards */}
          <div className="flex flex-col md:flex-row gap-6">
            <motion.button
              onClick={() => toggleSection('teams')}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 text-left bg-orange-50 rounded-3xl border-2 p-8 transition-colors ${activeSection === 'teams' ? 'border-orange-500' : 'border-orange-300 hover:border-orange-400'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl border-2 border-orange-400 bg-white flex items-center justify-center">
                    <svg className="w-7 h-7 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Teams</p>
                    <p className="text-4xl font-black text-blue-900">{teams.length}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-orange-600 font-semibold">
                {activeSection === 'teams' ? 'Hide list ↑' : 'View list →'}
              </p>
            </motion.button>

            <motion.button
              onClick={() => toggleSection('individuals')}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 text-left bg-orange-50 rounded-3xl border-2 p-8 transition-colors ${activeSection === 'individuals' ? 'border-orange-500' : 'border-orange-300 hover:border-orange-400'
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl border-2 border-orange-400 bg-white flex items-center justify-center">
                    <svg className="w-7 h-7 text-orange-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Individuals</p>
                    <p className="text-4xl font-black text-blue-900">{individuals.length}</p>
                  </div>
                </div>
              </div>
              <p className="mt-4 text-sm text-orange-600 font-semibold">
                {activeSection === 'individuals' ? 'Hide list ↑' : 'View list →'}
              </p>
            </motion.button>
          </div>

          {/* Expanded list */}
          <AnimatePresence mode="wait">
            {activeSection && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-6"
              >
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 space-y-3 max-h-[70vh] overflow-y-auto">
                  {activeSection === 'teams' ? (
                    teams.length > 0 ? (
                      teams.map((team, index) => (
                        <TeamRowCard
                          key={team.id || team._id}
                          team={team}
                          index={index}
                          onClick={() => setSelectedTeam(team)}
                        />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-slate-500 text-lg">No teams have registered yet.</p>
                      </div>
                    )
                  ) : individuals.length > 0 ? (
                    individuals.map((individual, index) => (
                      <IndividualRowCard
                        key={individual.id}
                        individual={individual}
                        index={index}
                        teamName={teamNameById[individual.teamId]}
                        onClick={() => setSelectedIndividual(individual)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <p className="text-slate-500 text-lg">No individuals have registered yet.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Modals */}
      {selectedTeam && <TeamDetailsModal team={selectedTeam} onClose={closeModal} />}
      {selectedIndividual && (
        <IndividualDetailModal
          individual={selectedIndividual}
          teamName={teamNameById[selectedIndividual.teamId]}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default SIHRegisteredPage;