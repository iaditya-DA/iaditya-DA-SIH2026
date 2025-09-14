import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';

const ScrollSection = ({ children, className = "", offset = ["start end", "end start"] }) => {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset
  });

  const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0.8, 1, 1, 0.8]);

  return (
    <motion.div
      ref={ref}
      style={{ y, opacity, scale }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const DataCard = ({ title, description, icon, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      viewport={{ once: true, margin: "-100px" }}
      className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 hover:border-cyan-400/50 transition-all duration-300"
      whileHover={{ scale: 1.02, y: -5 }}
    >
      {/* Background glow */}
      <motion.div
        className="absolute inset-0 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100"
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative z-10">
        <motion.div
          className="w-16 h-16 mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center"
          whileHover={{ rotate: 360, scale: 1.1 }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-2xl">{icon}</span>
        </motion.div>
        
        <h3 className="text-2xl font-bold text-white mb-4">{title}</h3>
        <p className="text-slate-300 leading-relaxed">{description}</p>
        
        {/* Interactive arrow */}
        <motion.div
          className="mt-6 flex items-center text-cyan-400 cursor-pointer"
          whileHover={{ x: 5 }}
        >
          <span className="font-medium">Learn more</span>
          <motion.svg
            className="w-5 h-5 ml-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            whileHover={{ x: 3 }}
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </motion.svg>
        </motion.div>
      </div>
    </motion.div>
  );
};

const FluidContentSections = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], [0, -500]);
  const floatingElementsY = useTransform(scrollYProgress, [0, 1], [0, 200]);

  return (
    <div ref={containerRef} className="relative">
      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 overflow-hidden"
      >
        <div className="absolute top-1/4 left-10 w-64 h-64 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        style={{ y: floatingElementsY }}
        className="absolute inset-0"
      >
        <motion.div
          className="absolute top-1/3 right-1/4 w-4 h-4 bg-cyan-400 rounded-full"
          animate={{ 
            scale: [1, 1.5, 1],
            opacity: [0.5, 1, 0.5] 
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        <motion.div
          className="absolute bottom-1/3 left-1/3 w-2 h-2 bg-purple-400 rounded-full"
          animate={{ 
            y: [0, -20, 0],
            opacity: [0.3, 1, 0.3] 
          }}
          transition={{ duration: 4, repeat: Infinity, delay: 1 }}
        />
      </motion.div>

      {/* About Section */}
      <ScrollSection className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <motion.h2
              className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-6"
              whileInView={{ 
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"]
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              Data Quest
            </motion.h2>
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "100%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              viewport={{ once: true }}
              className="h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent max-w-md mx-auto mb-8"
            />
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Embark on a journey of discovery where every interaction shapes your unique digital narrative
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <DataCard
              title="Navigate"
              description="Chart your course through the digital landscape with personalized navigation that adapts to your preferences and behaviors."
              icon="🧭"
              delay={0}
            />
            <DataCard
              title="Discover"
              description="Uncover hidden patterns in your data journey and discover insights that reveal the story of your digital evolution."
              icon="🔍"
              delay={0.2}
            />
            <DataCard
              title="Transform"
              description="Transform raw data into meaningful experiences that enhance your understanding and connection to the digital world."
              icon="⚡"
              delay={0.4}
            />
          </div>
        </div>
      </ScrollSection>

      {/* Journey Section */}
      <ScrollSection className="py-32 px-6" offset={["start 0.5", "end start"]}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
            >
              <h3 className="text-4xl md:text-5xl font-bold text-white mb-8">
                Your Journey
                <span className="block text-cyan-400">Begins Here</span>
              </h3>
              <p className="text-lg text-slate-300 mb-8 leading-relaxed">
                Every click, every scroll, every interaction contributes to a growing understanding 
                of your digital preferences. Our Navigator learns and evolves with you, creating 
                an increasingly personalized experience.
              </p>
              
              <motion.div
                className="space-y-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                viewport={{ once: true }}
              >
                {['Adaptive Learning', 'Personalized Insights', 'Seamless Integration'].map((feature, index) => (
                  <motion.div
                    key={feature}
                    className="flex items-center space-x-4"
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * index, duration: 0.5 }}
                    viewport={{ once: true }}
                  >
                    <motion.div
                      className="w-3 h-3 bg-cyan-400 rounded-full"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: index * 0.5 }}
                    />
                    <span className="text-white font-medium">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              viewport={{ once: true }}
              className="relative"
            >
              <motion.div
                className="relative w-full h-96 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 backdrop-blur-xl border border-white/10 overflow-hidden"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.3 }}
              >
                {/* Animated content inside */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 to-purple-400/10"
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 1, 0],
                  }}
                  transition={{ duration: 8, repeat: Infinity }}
                />
                
                <div className="relative z-10 p-8 h-full flex items-center justify-center">
                  <motion.div
                    className="text-center"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                  >
                    <motion.div
                      className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center"
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                      <span className="text-3xl">🚀</span>
                    </motion.div>
                    <h4 className="text-2xl font-bold text-white mb-4">Interactive Preview</h4>
                    <p className="text-slate-300">Experience the journey in real-time</p>
                  </motion.div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </ScrollSection>

      {/* Stats Section */}
      <ScrollSection className="py-32 px-6" offset={["start 0.3", "end start"]}>
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {[
              { number: "10K+", label: "Active Navigators" },
              { number: "1M+", label: "Data Points Collected" },
              { number: "99.9%", label: "Personalization Accuracy" }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center p-8 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.h4
                  className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400 mb-4"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ delay: index * 0.2 + 0.3, duration: 0.5, type: "spring" }}
                  viewport={{ once: true }}
                >
                  {stat.number}
                </motion.h4>
                <p className="text-slate-300 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </ScrollSection>
    </div>
  );
};

export default FluidContentSections;