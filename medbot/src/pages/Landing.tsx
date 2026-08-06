import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Bot, ScanLine, Calendar as CalendarIcon, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PillNav from '@/components/ui/PillNav';
import PixelCard from '@/components/ui/PixelCard';
import HeroBackground from '@/components/landing/HeroBackground';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const navItems = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Footer', href: '#footer' },
  ];

  return (
    <div className="min-h-screen bg-[#11222C] text-white overflow-y-auto font-geist">
      {/* Top Floating PillNav Header */}
      <div className="fixed top-4 inset-x-0 z-50 flex justify-center px-4">
        <PillNav
          logo="/group-18.png"
          logoAlt="MedBot Logo"
          items={navItems}
          activeHref="#home"
          baseColor="#11222C"
          pillColor="#0891B2"
          hoveredPillTextColor="#11222C"
          pillTextColor="#ffffff"
        />
      </div>

      {/* Futuristic Orbital Glow Hero Background */}
      <HeroBackground>
        <section id="home" className="relative pt-42 pb-42 px-6 lg:px-12 w-full flex flex-col items-center text-center justify-center min-h-[85vh]">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative z-10 max-w-4xl mx-auto flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#16A34A]/20 text-[#16A34A] text-xs font-bold uppercase tracking-wider mb-6 border border-[#16A34A]/30 backdrop-blur-sm shadow-sm">
              <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse" />
              MedBot AI Health Platform 2026
            </div>

            <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight text-white drop-shadow-md">
              AI-Powered Personal <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#06B6D4] via-[#0891B2] to-[#10B981]">
                Health Intelligence
              </span>
            </h1>

            <p className="text-lg text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed drop-shadow-sm">
              Your 24/7 intelligent medical assistant. Monitor vitals in real time, scan prescriptions instantly with AI OCR, and interact with our 3D health avatar.
            </p>

            <div className="flex items-center justify-center">
              <button
                onClick={() => navigate('/login')}
                className="group bg-[#0891B2] hover:bg-[#067a96] text-white px-8 py-4 rounded-full text-base font-bold transition-colors flex items-center gap-3 cursor-pointer shadow-lg"
              >
                Get Started Now
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>
        </section>
      </HeroBackground>

      {/* About Section featuring PixelCard components */}
      <section id="about" className="py-20 px-6 lg:px-12 bg-black/20 relative z-10 border-t border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold mb-4 tracking-tight">
              Comprehensive Health Management
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              Built with cutting-edge medical algorithms and 3D simulation for actionable patient care.
            </p>
          </div>

          {/* Grid of PixelCard components */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Activity,
                title: "Real-time Vitals",
                desc: "Continuous physiological tracking for Blood Pressure, Heart Rate, Blood Oxygen & Glucose levels.",
                variant: "blue" as const,
              },
              {
                icon: Bot,
                title: "3D Health Avatar",
                desc: "Lifelike R3F FBX digital companion providing interactive guidance and conversational feedback.",
                variant: "blue" as const,
              },
              {
                icon: ScanLine,
                title: "OCR Scanner",
                desc: "Instant document parser for prescription dosage extraction and ECG rhythm reading.",
                variant: "blue" as const,
              },
              {
                icon: CalendarIcon,
                title: "Smart Calendar",
                desc: "Automated medication reminders, doctor appointments, and proactive health alerts.",
                variant: "blue" as const,
              },
            ].map((card, i) => (
              <PixelCard key={i} variant={card.variant}>
                <div className="w-12 h-12 rounded-2xl bg-[#0891B2]/20 border border-[#0891B2]/40 flex items-center justify-center text-[#0891B2] mb-4">
                  <card.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                <p className="text-gray-300 text-sm leading-relaxed">{card.desc}</p>
                <div className="mt-auto pt-4">
                  <span className="text-xs font-bold text-[#0891B2] uppercase tracking-wider">
                    Learn More →
                  </span>
                </div>
              </PixelCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Section */}
      <footer id="footer" className="py-16 border-t border-gray-800 text-center relative z-10 bg-[#11222C]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-3 mb-6">
            <img src="/group-18.png" alt="MedBot Logo" className="w-10 h-10 object-contain" />
            <span className="text-2xl font-bold text-white tracking-wide">MedBot</span>
          </div>
          <h2 className="text-3xl font-bold mb-6">Ready to transform your personal health journey?</h2>
          <button
            onClick={() => navigate('/login')}
            className="bg-[#0891B2] text-[#ffffff] font-bold px-8 py-3.5 rounded-full hover:bg-[#067a96] transition-all shadow-lg cursor-pointer uppercase tracking-wider text-sm"
          >
            Join MedBot Today
          </button>
          <p className="mt-12 text-xs text-gray-500 font-mono">
            © 2026 MedBot SaaS Health Intelligence. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
