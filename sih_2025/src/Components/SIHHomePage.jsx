import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { ModernHeroBackground } from './ModernHeroBackground.jsx';

// SIH Hero Section with Character Animations
const SIHFluidHero = ({ setPage }) => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.5, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.8]);

  return (
    <motion.section
      ref={containerRef}
      className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gray-50 pt-20"
      style={{ y, opacity, scale }}
    >

      {/* Main Content */}
      <div className="relative z-10 text-center px-6 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <h1 className="text-6xl md:text-8xl font-bold text-blue-900 leading-tight mb-6">
            SIH 2026
          </h1>
          <p className="text-2xl md:text-4xl text-slate-700 font-semibold mb-4">
            LNCT University Bhopal
          </p>
        </motion.div>

        {/* SIH Status Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="my-10 max-w-4xl mx-auto"
        >
          <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
            <h2 className="text-3xl font-bold text-blue-900 mb-6">SIH 2026 - Team Registration Open  </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <motion.div
                className="bg-green-50 border border-green-200 rounded-xl p-4"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <p className="text-green-800 font-semibold">Team Registration OPEN</p>
                <p className="text-green-700 text-sm mt-1">Create your team or join an existing team.</p>
              </motion.div>

              <motion.div
                className="bg-orange-50 border border-orange-200 rounded-xl p-4"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <p className="text-green-800 font-semibold">Team Formation</p>
                <p className="text-green-700 text-sm mt-1">Find teammates and complete your SIH 2026 team.</p>
              </motion.div>

              <motion.div
                className="bg-blue-50 border border-blue-200 rounded-xl p-4"
                whileHover={{ scale: 1.02, y: -5 }}
              >
                <p className="text-blue-800 font-semibold">WhatsApp Group</p>
                <p className="text-blue-700 text-sm mt-1">Join for announcements & updates.</p>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="space-y-4 md:space-y-0 md:space-x-6 flex flex-col md:flex-row justify-center items-center"
        >
          <motion.button
            onClick={() => setPage('team-register')}
            className="px-10 py-4 text-xl bg-orange-500 hover:bg-orange-600 rounded-full font-bold relative text-white shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Register Team</span>
          </motion.button>

          <motion.button
            onClick={() => setPage('individual-register')}
            className="px-10 py-4 text-xl bg-blue-900 hover:bg-blue-800 rounded-full font-bold relative text-white shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>Register Individual</span>
          </motion.button>

          <motion.button
            onClick={() => window.open("https://chat.whatsapp.com/EDsmFIG40GUAs2gvWnujlZ?s=cl&p=a&ilr=4", "_blank")}
            className="px-10 py-4 text-xl bg-white border-2 border-orange-500 text-orange-600 hover:bg-orange-50 rounded-full font-bold transition-all duration-300 shadow-md"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            Join Official WhatsApp Group
          </motion.button>


        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center text-slate-500 font-semibold"
        >
          <span className="text-sm mb-2">Scroll to explore</span>
          <motion.div
            className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center"
            whileHover={{ scale: 1.1 }}
          >
            <motion.div
              className="w-1 h-3 bg-orange-500 rounded-full mt-2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </motion.section>
  );
};

// SIH Content Sections
const SIHContentSections = () => {
  const [openFaq, setOpenFaq] = useState(null);

  // Ordered by what people are most likely to ask right now:
  // registration status first, then the practical "how do I register" details,
  // and finally the Round 1 results question (which is further out, post
  // internal hackathon) and general contact/help queries.
  const FAQ_DATA = [
    { q: "Are registrations still open?", a: "Yes! Registrations are now open again — both individual and team registrations. Head to the Registration section to sign up." },
    { q: "What is the team size limit?", a: "Teams must have a minimum of 2 members and a maximum of 6 members, including the team leader." },
    { q: "How can team leaders join the WhatsApp group?", a: "Team leaders should check their WhatsApp for the group invitation link. The invitation is sent to the contact number provided during registration." },
    { q: "Where can I find the Round 1 results?", a: "Round 1 results will be declared after the internal hackathon. Keep an eye on the Results section and the WhatsApp group for the announcement." },
    { q: "What if I have questions about my registration?", a: "Please reach out to the contacts listed at the bottom of this page for any registration-related queries." }
  ];

  return (
    <>
      {/* Next Steps Section
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-32 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 text-blue-900">
            Next Steps & Updates
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { emoji: "", title: "Round 1 Results", subtitle: "PPT Round Results", date: "NOW AVAILABLE!", color: "green" },
              { emoji: "", title: "WhatsApp Group", subtitle: "Team Leaders Only", date: "Check your WhatsApp!", color: "blue" },
              { emoji: "", title: "Registration Status", subtitle: "All Registrations", date: "Closed Successfully", color: "orange" }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-lg h-full">
                  <div className="text-5xl mb-4">{item.emoji}</div>
                  <h3 className={`text-2xl font-bold text-${item.color}-600 mb-2`}>{item.title}</h3>
                  <p className="text-slate-600 mb-2 font-medium">{item.subtitle}</p>
                  <p className={`text-${item.color}-500 font-bold`}>{item.date}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section> */}

      {/* Timeline Section
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-20 px-6"
      >
        <div className="max-w-2xl mx-auto">
          <img
            src="/flow.png"
            alt="Smart India Hackathon 2026 Timeline"
            className="w-full h-auto"
          />
        </div>
      </motion.section> */}

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-32 px-6 bg-white border-y border-gray-200"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 text-blue-900">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {FAQ_DATA.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                  <motion.button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full text-left p-6 font-bold text-lg flex justify-between items-center text-slate-800"
                    whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
                  >
                    <span>{faq.q}</span>
                    <motion.span
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-orange-500"
                    >
                      ▼
                    </motion.span>
                  </motion.button>

                  <AnimatePresence>
                    {openFaq === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-6 border-t border-gray-200 text-slate-600 bg-white">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Contact Section */}
      <motion.section
        initial={{ opacity: 0, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="py-32 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl md:text-6xl font-bold text-center mb-16 text-blue-900">
            Need Help?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {[
              { name: "Aditya Kumar Jha", phone: "+91 7492001966", instagram: "adityakrjhaa" },
              { name: "Atul Kumar Patel", phone: "+91 9691737509", instagram: "atul._505" }
            ].map((contact, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
              >
                <div className="text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-lg">
                  <p className="text-2xl font-bold text-slate-800 mb-2">{contact.name}</p>
                  <p className="font-mono text-orange-500 font-bold text-lg mb-4">{contact.phone}</p>
                  <motion.a
                    href={`https://www.instagram.com/${contact.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-900 font-semibold transition-colors"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>Instagram</span>
                    <span>@{contact.instagram}</span>
                  </motion.a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    </>

  );
};
// ===== SIH FINALIST AUTO SCROLL CAROUSEL =====
const FinalistCarousel = () => {
  const finalistImages = [
    { src: '/LITSQUAD.jpeg', year: 'SIH 2025 Finalists' },
    { src: '/LTSQUAD.jpeg', year: 'SIH 2025 Finalists' },
    { src: '/pixels.jpeg', year: 'SIH 2025 Finalists' },
    { src: '/sih2025_pixels.jpeg', year: 'SIH 2025 Finalists' },
    { src: '/SIH2024.jpg', year: 'SIH 2024 Finalists' },
  ];

  return (
    <section className="hidden md:block py-6 bg-transparent overflow-hidden">
      <div className="w-full px-0">

        {/* Heading */}
        <div className="text-center mb-10">
          <h2 className="text-4xl md:text-5xl font-bold text-blue-900 mb-4">
            SIH 2024 & 2025 Finalist Showcase
          </h2>
          <p className="text-slate-600 text-lg">
            LNCT University BCA teams selected for Smart India Hackathon
          </p>
        </div>

        {/* Auto Scrolling Track */}
        <div className="relative overflow-hidden rounded-none w-full">
          <motion.div
            className="flex items-center gap-8 w-max py-2"
            animate={{ x: ['0%', '-50%'] }}
            transition={{
              duration: 40,
              repeat: Infinity,
              ease: 'linear',
            }}
          >
            {[...finalistImages, ...finalistImages].map((item, index) => (
              <div
                key={index}
                className="relative flex-shrink-0 w-[82vw] md:w-[880px] h-[250px] md:h-[330px] rounded-3xl overflow-hidden shadow-xl group mx-3"
              >
                <img
                  src={item.src}
                  alt={item.year}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />

                {/* Dark Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Year Badge */}
                <div className="absolute bottom-6 left-6">
                  <span className="bg-orange-500 text-white px-5 py-2 rounded-full text-sm md:text-base font-bold shadow-2xl">
                    {item.year}
                  </span>
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Main SIH Home Page Component
const SIHHomePage = ({ setPage }) => {
  return (
    <>
      {/* FINALIST AUTO SCROLL - SABSE PEHLE */}
      <FinalistCarousel />

      {/* HERO SECTION */}
      <SIHFluidHero setPage={setPage} />

      {/* BAAKI CONTENT */}
      <SIHContentSections />
    </>
  );
};

export default SIHHomePage;