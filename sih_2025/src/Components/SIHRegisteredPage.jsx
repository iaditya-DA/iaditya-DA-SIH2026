import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const scrollbarStyles = `
  .sih-modal-scroll::-webkit-scrollbar { width: 8px; }
  .sih-modal-scroll::-webkit-scrollbar-track { background: transparent; }
  .sih-modal-scroll::-webkit-scrollbar-thumb { background-color: #fdba74; border-radius: 9999px; }
  .sih-modal-scroll::-webkit-scrollbar-thumb:hover { background-color: #f97316; }
  .sih-modal-scroll { scrollbar-width: thin; scrollbar-color: #fdba74 transparent; }
`;

const getInitials = (name = '') =>
  name.trim().split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('') || '?';

const Avatar = ({ name, tone = 'orange', size = 'md' }) => {
  const tones = {
    orange: 'bg-orange-100 text-orange-700 border-orange-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
  };
  const sizes = {
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-14 h-14 text-lg',
  };
  return (
    <div className={`rounded-full border-2 flex items-center justify-center font-bold flex-shrink-0 ${tones[tone]} ${sizes[size]}`}>
      {getInitials(name)}
    </div>
  );
};

// ---- Small inline icon set (replaces emoji for a cleaner, consistent look) ----
const Icon = {
  phone: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.28a1 1 0 01.95.68l1.1 3.3a1 1 0 01-.27 1.03L7.6 9.5a11 11 0 006.9 6.9l1.49-1.46a1 1 0 011.03-.27l3.3 1.1a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.6 21 3 14.4 3 6V5z" />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0 3.838a6.163 6.163 0 100 12.326 6.163 6.163 0 000-12.326zm0 10.162a4 4 0 110-8 4 4 0 010 8zm6.406-9.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  ),
  discord: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M20.317 4.369A19.79 19.79 0 0016.558 3c-.213.38-.43.874-.586 1.265a18.27 18.27 0 00-5.944 0A10.9 10.9 0 009.44 3a19.7 19.7 0 00-3.76 1.37C2.34 8.63 1.5 12.77 1.9 16.85a19.9 19.9 0 006.02 3.05c.487-.66.92-1.36 1.29-2.1-.71-.27-1.39-.6-2.03-.98.17-.12.34-.25.5-.38a14.2 14.2 0 0012.66 0c.16.13.33.26.5.38-.64.38-1.32.71-2.03.98.37.74.8 1.44 1.29 2.1a19.85 19.85 0 006.02-3.05c.48-4.73-.72-8.83-3.02-12.48zM9.68 14.4c-.86 0-1.56-.79-1.56-1.76 0-.97.68-1.76 1.56-1.76.89 0 1.58.8 1.56 1.76 0 .97-.68 1.76-1.56 1.76zm5.64 0c-.86 0-1.56-.79-1.56-1.76 0-.97.68-1.76 1.56-1.76.89 0 1.57.8 1.56 1.76 0 .97-.67 1.76-1.56 1.76z" />
    </svg>
  ),
  github: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.333-1.755-1.333-1.755-1.089-.744.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.807 1.305 3.492.998.108-.775.42-1.305.762-1.605-2.665-.303-5.467-1.332-5.467-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5l4-4a3.5 3.5 0 10-5-5l-4 4m-3 3l-4 4a3.5 3.5 0 105 5l4-4M9 15l6-6" />
    </svg>
  ),
  close: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
    </svg>
  ),
  users: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
    </svg>
  ),
  team: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
      <path d="M10 3.5c-4.5 0-8.2 3-9.5 6.5 1.3 3.5 5 6.5 9.5 6.5s8.2-3 9.5-6.5C18.2 6.5 14.5 3.5 10 3.5zM10 14a4 4 0 110-8 4 4 0 010 8z" />
    </svg>
  ),
};

// Reusable pill-style contact row: icon badge + label + value, used everywhere
// contact details are shown so the whole app reads consistently.
const ContactRow = ({ icon, label, value, href, tone = 'orange', copyable = false }) => {
  const [copied, setCopied] = useState(false);
  const toneClasses = tone === 'orange'
    ? 'bg-orange-50 border-orange-200 text-orange-600'
    : 'bg-blue-50 border-blue-200 text-blue-700';

  const handleCopy = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigator.clipboard?.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  const inner = (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 transition-colors hover:border-orange-300 group">
      <div className={`w-8 h-8 rounded-full border flex items-center justify-center flex-shrink-0 ${toneClasses}`}>
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">{label}</p>
        <p className="text-sm font-semibold text-slate-800 truncate">{value}</p>
      </div>
      {copyable && (
        <motion.button
          onClick={handleCopy}
          whileTap={{ scale: 0.9 }}
          className="text-[10px] font-bold flex-shrink-0 px-2 py-1 rounded-full border transition-colors"
          style={{
            color: copied ? '#16a34a' : '#f97316',
            borderColor: copied ? '#bbf7d0' : '#fed7aa',
            backgroundColor: copied ? '#f0fdf4' : '#fff7ed',
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </motion.button>
      )}
      {href && (
        <span className="text-slate-300 group-hover:text-orange-400 transition-colors flex-shrink-0">
          {Icon.link}
        </span>
      )}
    </div>
  );

  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer" className="block">{inner}</a>
  ) : inner;
};

// Overlapping avatar preview — gives a quick sense of "who's in this team"
// right on the row card, without needing to open the modal.
const AvatarStack = ({ names = [], tone = 'orange', max = 4 }) => {
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  const ring = tone === 'orange' ? 'ring-orange-50' : 'ring-blue-50';

  return (
    <div className="flex items-center flex-shrink-0">
      {shown.map((n, i) => (
        <div key={i} className={`ring-2 ${ring} rounded-full`} style={{ marginLeft: i === 0 ? 0 : -10 }}>
          <Avatar name={n} tone={tone} size="sm" />
        </div>
      ))}
      {extra > 0 && (
        <div
          className={`ring-2 ${ring} rounded-full w-9 h-9 bg-slate-700 text-white text-[11px] font-bold flex items-center justify-center`}
          style={{ marginLeft: -10 }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Stat strip — replaces the old dark-gradient + dot-pattern + glass-pill
// banner. That look reads as a generic AI template. This version is a
// plain white card, a thin orange rule to anchor the brand, and stats
// separated by hairline dividers like a real event dashboard — quieter,
// more credible, and it won't fight the orange/blue cards below it.
// ---------------------------------------------------------------------------
const StatCard = ({ icon, label, value, accent }) => {
  const accentClasses = accent === 'orange'
    ? { bar: 'bg-orange-400', chip: 'bg-orange-50 text-orange-600 border-orange-200' }
    : { bar: 'bg-blue-500', chip: 'bg-blue-50 text-blue-700 border-blue-200' };

  return (
    <div className="relative bg-white border border-gray-200 rounded-2xl pl-6 pr-5 py-4 flex items-center gap-4 overflow-hidden">
      <span className={`absolute left-0 top-0 bottom-0 w-1.5 ${accentClasses.bar}`} />
      <div className={`w-12 h-12 rounded-xl border flex items-center justify-center flex-shrink-0 ${accentClasses.chip}`}>
        {icon}
      </div>
      <div className="leading-tight">
        <p className="text-3xl font-black text-blue-900 tabular-nums leading-none">{value}</p>
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mt-1.5">{label}</p>
      </div>
    </div>
  );
};

const StatStrip = ({ total, teamsCount, individualsCount }) => (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
    <StatCard icon={Icon.users} label="Total Registered" value={total} accent="blue" />
    <StatCard icon={Icon.team} label="Teams" value={teamsCount} accent="orange" />
    <StatCard icon={Icon.users} label="Solo Builders" value={individualsCount} accent="blue" />
  </div>
);

const SectionLabel = ({ children }) => (
  <h3 className="text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
    <span className="w-4 h-px bg-orange-300" />
    {children}
  </h3>
);

const SkillTag = ({ children }) => (
  <span className="bg-orange-50 text-orange-700 border border-orange-200 text-[11px] font-bold px-2.5 py-1 rounded-full">
    {children}
  </span>
);

const ModalShell = ({ children, onClose, maxWidth = 'max-w-4xl' }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 10 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={`sih-modal-scroll relative bg-white border border-gray-200 rounded-3xl shadow-2xl w-full text-left max-h-[88vh] overflow-y-auto ${maxWidth}`}
        data-lenis-prevent
        onClick={e => e.stopPropagation()}
      >
        <style>{scrollbarStyles}</style>
        {children}
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

const ModalCloseButton = ({ onClose }) => (
  <motion.button
    onClick={onClose}
    aria-label="Close"
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center text-white transition-colors z-10"
  >
    {Icon.close}
  </motion.button>
);

// ---------------------------------------------------------------------------
// Team Details Modal
// ---------------------------------------------------------------------------
const TeamDetailsModal = ({ team, onClose }) => {
  if (!team) return null;
  const members = team.members.filter(m => m.name);

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-4xl">
      <div className="relative overflow-hidden p-6 md:p-8 sticky top-0 z-10 bg-gradient-to-r from-blue-900 to-blue-800 rounded-t-3xl">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        <ModalCloseButton onClose={onClose} />
        <div className="relative pr-10">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-orange-300 mb-2">
            Team
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white leading-tight">{team.teamName}</h2>
          {team.problemStatement && (
            <p className="text-blue-100/90 mt-3 text-sm leading-relaxed max-w-2xl">{team.problemStatement}</p>
          )}
          <span className="inline-block mt-4 text-xs font-bold bg-orange-500 text-white rounded-full px-3 py-1.5">
            {members.length + 1} Members
          </span>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        <div>
          <SectionLabel>Team Leader</SectionLabel>
          <div className="bg-blue-50/60 border border-blue-100 p-5 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <Avatar name={team.leader.name} tone="blue" size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-lg font-bold text-slate-800">{team.leader.name}</p>
                  <span className="text-[10px] font-bold uppercase tracking-wide bg-blue-900 text-white rounded-full px-2 py-0.5">
                    Leader
                  </span>
                </div>
                <p className="text-slate-500 text-sm">{team.leader.branch} · {team.leader.year}</p>
              </div>
            </div>
            {(team.leader.contactNumber || team.leader.githubLink) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {team.leader.contactNumber && (
                  <ContactRow icon={Icon.phone} label="Phone" value={team.leader.contactNumber} tone="blue" copyable />
                )}
                {team.leader.githubLink && (
                  <ContactRow icon={Icon.github} label="GitHub" value={team.leader.githubLink} href={team.leader.githubLink} tone="blue" />
                )}
              </div>
            )}
          </div>
        </div>

        {members.length > 0 && (
          <div>
            <SectionLabel>Members ({members.length})</SectionLabel>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {members.map((member, index) => {
                const allSkills = [
                  ...(member.skills || []),
                  ...(member.otherSkills ? member.otherSkills.split(',').map(s => s.trim()).filter(Boolean) : []),
                ];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.06 }}
                    className="bg-gray-50 border border-gray-200 p-4 rounded-2xl hover:border-orange-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar name={member.name} tone="orange" />
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-slate-800 truncate">{member.name}</p>
                        <p className="text-slate-500 text-xs">{member.branch} · {member.year}</p>
                      </div>
                    </div>

                    {(member.contactNumber || member.instagram || member.githubLink) && (
                      <div className="space-y-1.5 mb-3">
                        {member.contactNumber && (
                          <ContactRow icon={Icon.phone} label="Phone" value={member.contactNumber} copyable />
                        )}
                        {member.instagram && (
                          <ContactRow icon={Icon.instagram} label="Instagram" value={`@${member.instagram}`} />
                        )}
                        {member.githubLink && (
                          <ContactRow icon={Icon.github} label="GitHub" value={member.githubLink} href={member.githubLink} />
                        )}
                      </div>
                    )}

                    {allSkills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-gray-200">
                        {allSkills.map(skill => <SkillTag key={skill}>{skill}</SkillTag>)}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 flex justify-end rounded-b-3xl">
        <motion.button
          onClick={onClose}
          className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-2xl font-bold transition-colors shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </div>
    </ModalShell>
  );
};

// ---------------------------------------------------------------------------
// Individual Detail Modal
// ---------------------------------------------------------------------------
const IndividualDetailModal = ({ individual, teamName, onClose }) => {
  if (!individual) return null;

  const allSkills = [
    ...(individual.skills || []),
    ...(individual.otherSkills ? individual.otherSkills.split(',').map(s => s.trim()).filter(Boolean) : []),
  ];

  const contacts = [
    individual.contactNumber && { icon: Icon.phone, label: 'Phone', value: individual.contactNumber, copyable: true },
    individual.instagram && { icon: Icon.instagram, label: 'Instagram', value: `@${individual.instagram}` },
    individual.discord && { icon: Icon.discord, label: 'Discord', value: individual.discord },
    individual.github && { icon: Icon.github, label: 'GitHub', value: individual.github, href: individual.github },
  ].filter(Boolean);

  return (
    <ModalShell onClose={onClose} maxWidth="max-w-lg">
      <div className="relative overflow-hidden p-6 md:p-8 sticky top-0 z-10 bg-gradient-to-r from-blue-900 to-blue-800 rounded-t-3xl">
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '16px 16px' }}
        />
        <ModalCloseButton onClose={onClose} />
        <div className="relative flex items-center gap-4 pr-8">
          <div className="w-14 h-14 rounded-full border-2 border-orange-300 bg-white/10 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
            {getInitials(individual.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-black text-white truncate">{individual.name}</h2>
            <p className="text-blue-100 text-sm mt-0.5">{individual.branch} · {individual.year}</p>
          </div>
        </div>
        {individual.teamId && (
          <span className="inline-block mt-4 bg-orange-500 text-white text-xs font-bold px-3 py-1.5 rounded-full">
            {teamName ? `Team: ${teamName}` : 'In a team'}
          </span>
        )}
      </div>

      <div className="p-6 md:p-8 space-y-7">
        {allSkills.length > 0 && (
          <div>
            <SectionLabel>Skills</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {allSkills.map(skill => <SkillTag key={skill}>{skill}</SkillTag>)}
            </div>
          </div>
        )}

        {individual.hasDeployed && individual.productLink && (
          <div>
            <SectionLabel>Deployed Project</SectionLabel>
            <ContactRow icon={Icon.link} label="Live Link" value={individual.productLink} href={individual.productLink} />
          </div>
        )}

        <div>
          <SectionLabel>Contact</SectionLabel>
          {contacts.length > 0 ? (
            <div className="grid grid-cols-1 gap-2.5">
              {contacts.map((c, i) => <ContactRow key={i} {...c} />)}
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-6 text-center">
              <p className="text-slate-500 text-sm">This participant hasn't provided public contact details.</p>
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 sticky bottom-0 flex justify-end rounded-b-3xl">
        <motion.button
          onClick={onClose}
          className="bg-blue-900 hover:bg-blue-800 text-white px-8 py-3 rounded-2xl font-bold transition-colors shadow-sm"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Close
        </motion.button>
      </div>
    </ModalShell>
  );
};

// ---------------------------------------------------------------------------
// Shared "this is clickable" affordance — a real, full-width button pinned to
// the bottom of every card. A hover-only chevron or a small corner badge is
// too easy to miss (especially on touch devices); a labelled button never is.
// ---------------------------------------------------------------------------
const ViewDetailsButton = ({ label = 'View Full Details', tone = 'blue' }) => {
  const toneClasses = tone === 'blue'
    ? 'bg-blue-900 group-hover:bg-blue-800'
    : 'bg-orange-500 group-hover:bg-orange-600';
  return (
    <span className={`mt-4 w-full flex items-center justify-center gap-2 text-white font-bold text-sm rounded-xl py-2.5 transition-colors ${toneClasses}`}>
      {Icon.eye}
      {label}
    </span>
  );
};

// Wraps a row card with keyboard support (Enter / Space) so the click
// affordance also works for keyboard and screen-reader users, not just mouse.
const clickableCardProps = (onClick) => ({
  role: 'button',
  tabIndex: 0,
  onClick,
  onKeyDown: (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  },
});

// ---------------------------------------------------------------------------
// Row cards shown inside the expanded list
// ---------------------------------------------------------------------------
const TeamRowCard = ({ team, index, onClick }) => {
  const memberNames = [team.leader?.name, ...(team.members || []).filter(m => m.name).map(m => m.name)].filter(Boolean);
  const capacity = 6; // adjust if team size limit differs

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      {...clickableCardProps(onClick)}
      className="group bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 flex flex-col h-full"
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="min-w-0">
          <p className="font-black text-blue-900 text-lg truncate">{team.teamName}</p>
          <p className="text-sm text-slate-400 truncate mt-0.5">Leader: {team.leader?.name}</p>
        </div>
        <span className="flex-shrink-0 text-[11px] font-bold text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1 whitespace-nowrap">
          {memberNames.length}/{capacity} members
        </span>
      </div>

      <AvatarStack names={memberNames} tone="orange" />

      {team.problemStatement && (
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Problem Statement</p>
          <p className="text-sm text-slate-600 line-clamp-2">{team.problemStatement}</p>
        </div>
      )}

      <div className="mt-auto">
        <ViewDetailsButton label="View Full Details" tone="blue" />
      </div>
    </motion.div>
  );
};

const IndividualRowCard = ({ individual, index, teamName, onClick }) => {
  const allSkills = [
    ...(individual.skills || []),
    ...(individual.otherSkills ? individual.otherSkills.split(',').map(s => s.trim()).filter(Boolean) : []),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      {...clickableCardProps(onClick)}
      className="group bg-white border border-gray-200 rounded-2xl p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-orange-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 flex flex-col h-full"
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Avatar name={individual.name} tone="blue" />
        <div className="min-w-0 flex-1">
          <p className="font-black text-blue-900 truncate">{individual.name}</p>
          {individual.teamId && (
            <p className="text-[11px] font-semibold text-orange-500 truncate">
              {teamName ? `Team: ${teamName}` : 'In a team'}
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-1">
        {individual.branch && (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
            {individual.branch}
          </span>
        )}
        {individual.year && (
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded-full px-2.5 py-1">
            {individual.year}
          </span>
        )}
      </div>

      {allSkills.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Skills</p>
          <div className="flex flex-wrap gap-1.5">
            {allSkills.map(skill => <SkillTag key={skill}>{skill}</SkillTag>)}
          </div>
        </div>
      )}

      <div className="mt-auto">
        <ViewDetailsButton label="View Profile" tone="blue" />
      </div>
    </motion.div>
  );
};

// ---------------------------------------------------------------------------
// Main SIH Registered Page Component
// ---------------------------------------------------------------------------
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

  const totalRegistered = teams.reduce((sum, t) => sum + 1 + (t.members?.filter(m => m.name).length || 0), 0) + individuals.length;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-2 text-blue-900">
            Registered Participants
          </h2>
          <p className="text-center text-sm text-slate-400 mb-8">
            Tap a team or a name below to see their full profile and contact details.
          </p>

          <StatStrip total={totalRegistered} teamsCount={teams.length} individualsCount={individuals.length} />

          <div className="flex flex-col md:flex-row gap-6">
            <motion.button
              onClick={() => toggleSection('teams')}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 text-left bg-orange-50 rounded-3xl border-2 p-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${activeSection === 'teams' ? 'border-orange-500' : 'border-orange-300 hover:border-orange-400'
                }`}
            >
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
              <p className="mt-4 text-sm text-orange-600 font-semibold">
                {activeSection === 'teams' ? 'Hide list ↑' : 'View list →'}
              </p>
            </motion.button>

            <motion.button
              onClick={() => toggleSection('individuals')}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              className={`flex-1 text-left bg-orange-50 rounded-3xl border-2 p-8 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${activeSection === 'individuals' ? 'border-orange-500' : 'border-orange-300 hover:border-orange-400'
                }`}
            >
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
              <p className="mt-4 text-sm text-orange-600 font-semibold">
                {activeSection === 'individuals' ? 'Hide list ↑' : 'View list →'}
              </p>
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            {activeSection && (
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-6"
              >
                <div
                  className="sih-modal-scroll bg-white rounded-3xl border border-gray-200 p-5 md:p-6 max-h-[70vh] overflow-y-auto"
                  data-lenis-prevent
                >
                  <style>{scrollbarStyles}</style>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-stretch">
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
                        <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-14">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                            <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                            </svg>
                          </div>
                          <p className="text-slate-500 text-lg font-medium">No teams have registered yet.</p>
                          <p className="text-slate-400 text-sm mt-1">Teams will show up here as soon as they sign up.</p>
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
                      <div className="col-span-1 sm:col-span-2 lg:col-span-3 text-center py-14">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center">
                          <svg className="w-7 h-7 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p className="text-slate-500 text-lg font-medium">No individuals have registered yet.</p>
                        <p className="text-slate-400 text-sm mt-1">Solo builders will appear here once they sign up.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

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