const fs = require('fs');
const path = require('path');

const ROOT = 'C:\\Users\\srikh\\.gemini\\antigravity\\worktrees\\Medbot-AI-Health-Assistant\\setup-medcore-ai-agent\\medbot';

const write = (filePath, content) => {
    const fullPath = path.join(ROOT, filePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, content.trim() + '\n', 'utf8');
};

const layouts = {
    'src/app/layouts/RootLayout.tsx': `
import React, { Component, ReactNode, Suspense } from 'react';
import { Outlet } from 'react-router';

/**
 * Props for ErrorBoundary
 */
interface ErrorBoundaryProps {
  children: ReactNode;
}

/**
 * State for ErrorBoundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

/**
 * Root Error Boundary Component
 */
class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen items-center justify-center bg-[#11222C] text-white">
          <div className="text-center space-y-4 p-8 bg-[#DDD4D8] rounded-xl text-black">
            <h1 className="text-3xl font-bold text-red-600">Something went wrong.</h1>
            <p className="text-gray-700">{this.state.error?.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-[#0891B2] text-white rounded hover:bg-[#067a96]"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Top-level application layout
 */
export const RootLayout: React.FC = () => {
  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-[#11222C]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0891B2]"></div>
        </div>
      }>
        <Outlet />
      </Suspense>
    </ErrorBoundary>
  );
};
export default RootLayout;
`,
    'src/app/layouts/DashboardLayout.tsx': `
import React from 'react';
import { Outlet } from 'react-router';
// TODO Phase 2: Import real Sidebar and TopHeader components when available
// import { Sidebar } from '@/components/layout/Sidebar';
// import { TopHeader } from '@/components/layout/TopHeader';

/**
 * Dashboard Layout Wrapper
 * Features fixed sidebar and header with scrollable main content
 */
export const DashboardLayout: React.FC = () => {
  return (
    <div className="flex h-screen w-full bg-[#11222C] text-white overflow-hidden">
      {/* Mock Sidebar */}
      <div className="hidden md:flex w-64 bg-[#DDD4D8] text-black border-r border-[#0891B2]">
        {/* <Sidebar /> */}
        <div className="p-4 font-bold text-lg text-center w-full">MedBot Sidebar</div>
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mock Top Header */}
        <header className="h-16 bg-[#DDD4D8] text-black border-b border-[#0891B2] flex items-center justify-between px-6">
          {/* <TopHeader /> */}
          <div className="font-semibold text-xl">TopHeader</div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
export default DashboardLayout;
`,
    'src/app/layouts/AuthLayout.tsx': `
import React from 'react';
import { Outlet } from 'react-router';
import { HelpCircle } from 'lucide-react';

/**
 * Authentication Layout Component
 * Provides a fullscreen centered design with a radial pattern
 */
export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#11222C] relative overflow-hidden">
      {/* Figma background pattern simulation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none figma-bg-pattern bg-[radial-gradient(circle_at_center,_#0891B2_0%,_transparent_70%)]"></div>

      {/* Top Bar */}
      <header className="relative z-10 flex justify-between items-center p-6 lg:px-12">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0891B2] flex items-center justify-center font-bold text-white">M</div>
          <span className="text-xl font-bold text-white tracking-wide">MedBot</span>
        </div>
        <button className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
          <HelpCircle size={20} />
          <span className="hidden sm:inline">Need Help?</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <Outlet />
      </main>
    </div>
  );
};
export default AuthLayout;
`
};

const routes = {
    'src/app/routes.tsx': `
import React, { lazy } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router';
import RootLayout from './layouts/RootLayout';
import AuthLayout from './layouts/AuthLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Lazy load pages
const LandingPage = lazy(() => import('@/pages/Landing'));
const LoginPage = lazy(() => import('@/pages/Login'));
const DashboardPage = lazy(() => import('@/pages/Dashboard'));
const ChatPage = lazy(() => import('@/pages/Chat'));
const AnalyticsPage = lazy(() => import('@/pages/Analytics'));
const IntegrationPage = lazy(() => import('@/pages/Integration'));
const CalendarPage = lazy(() => import('@/pages/Calendar'));
const SettingsPage = lazy(() => import('@/pages/Settings'));
const ProfilePage = lazy(() => import('@/pages/Profile'));
const NotFoundPage = lazy(() => import('@/pages/NotFound'));

/**
 * Application Routes Configuration
 */
const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        element: <AuthLayout />,
        children: [
          {
            path: 'login',
            element: <LoginPage />,
          }
        ]
      },
      {
        path: 'dashboard',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },
          {
            path: 'chat',
            element: <ChatPage />,
          },
          {
            path: 'analytics',
            element: <AnalyticsPage />,
          },
          {
            path: 'integration',
            element: <IntegrationPage />,
          },
          {
            path: 'calendar',
            element: <CalendarPage />,
          },
          {
            path: 'settings',
            element: <SettingsPage />,
          }
        ]
      },
      {
        path: 'profile',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <ProfilePage />,
          }
        ]
      },
      {
        path: '*',
        element: <NotFoundPage />,
      }
    ],
  },
]);

/**
 * Main App Router Component
 */
export const AppRoutes: React.FC = () => {
  return <RouterProvider router={router} />;
};
export default AppRoutes;
`
};

const pages = {
    'src/pages/Landing.tsx': `
import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Bot, ScanLine, Calendar as CalendarIcon, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { useNavigate } from 'react-router';

/**
 * Premium SaaS Landing Page
 */
const Landing: React.FC = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen bg-[#11222C] text-white overflow-y-auto"
    >
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#11222C]/90 backdrop-blur-md border-b border-[#0891B2]/30 px-6 lg:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-[#0891B2] flex items-center justify-center font-bold">M</div>
          <span className="text-xl font-bold tracking-wide">MedBot</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How it Works</a>
          <a href="#testimonials" className="hover:text-white transition">Testimonials</a>
        </nav>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/login')}
            className="text-gray-300 hover:text-white text-sm font-medium transition"
          >
            Login
          </button>
          <button 
            onClick={() => navigate('/login')}
            className="bg-[#0891B2] hover:bg-[#067a96] text-white px-5 py-2 rounded-full text-sm font-medium transition-colors"
          >
            Get Started
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-32 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl aspect-square bg-[#0891B2]/20 blur-[120px] rounded-full pointer-events-none"></div>
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="relative z-10"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#16A34A]/20 text-[#16A34A] text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-[#16A34A] animate-pulse"></span>
            MedBot v2.0 Now Available
          </div>
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 leading-tight tracking-tight">
            AI-Powered Personal <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0891B2] to-[#16A34A]">Health Intelligence</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Your 24/7 intelligent medical assistant. Monitor vitals, scan prescriptions instantly, and interact with our breakthrough 3D health avatar.
          </p>
          <button 
            onClick={() => navigate('/login')}
            className="group bg-white text-[#11222C] px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-100 transition-all flex items-center gap-3 mx-auto"
          >
            Start Free Trial
            <ArrowRight className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

        {/* Interactive Demo Preview (Mock) */}
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-16 w-full max-w-5xl rounded-2xl border border-gray-800 bg-[#DDD4D8]/5 p-2 shadow-2xl relative z-10 overflow-hidden"
        >
          <div className="aspect-[16/9] bg-gradient-to-br from-gray-900 to-[#11222C] rounded-xl flex items-center justify-center border border-gray-800 relative">
             <Bot size={64} className="text-[#0891B2] opacity-50" />
             <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{backgroundImage: 'url("https://images.unsplash.com/photo-1551076805-e18690c5e561?q=80&w=1000")'}}></div>
          </div>
        </motion.div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Comprehensive Health Management</h2>
            <p className="text-gray-400">Everything you need to take control of your well-being.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Activity, title: 'Real-time Vitals', desc: 'Sync your devices to monitor heart rate, glucose, and more.' },
              { icon: Bot, title: '3D Interactive Bot', desc: 'Converse naturally with your lifelike digital health companion.' },
              { icon: ScanLine, title: 'OCR Prescription', desc: 'Instantly scan and extract data from medical documents.' },
              { icon: CalendarIcon, title: 'Smart Calendar', desc: 'Automated reminders for medications and appointments.' },
            ].map((f, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="bg-[#DDD4D8]/10 p-6 rounded-2xl border border-gray-800 hover:border-[#0891B2] transition-colors"
              >
                <div className="w-12 h-12 bg-[#0891B2]/20 rounded-xl flex items-center justify-center text-[#0891B2] mb-6">
                  <f.icon size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <footer className="py-12 border-t border-gray-800 text-center">
        <h2 className="text-2xl font-bold mb-6">Ready to transform your health journey?</h2>
        <button 
          onClick={() => navigate('/login')}
          className="bg-[#0891B2] text-white px-8 py-3 rounded-full font-medium hover:bg-[#067a96] transition-colors"
        >
          Join MedBot Today
        </button>
        <p className="mt-12 text-sm text-gray-500">© 2026 MedBot SaaS. All rights reserved.</p>
      </footer>
    </motion.div>
  );
};
export default Landing;
`,
    'src/pages/Login.tsx': `
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';
// TODO Phase 2: Import authStore

/**
 * Login Page Component
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mock login delay
    setTimeout(() => {
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-md bg-[#DDD4D8] rounded-2xl shadow-2xl p-8 border-t-4 border-[#0891B2]"
    >
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
        <p className="text-gray-600">Sign in to your MedBot account</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0891B2] focus:border-transparent outline-none bg-white text-gray-900"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#0891B2] focus:border-transparent outline-none bg-white text-gray-900"
            placeholder="••••••••"
          />
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-gray-600">
            <input type="checkbox" className="mr-2 rounded text-[#0891B2]" />
            Remember me
          </label>
          <a href="#" className="text-[#0891B2] hover:underline font-medium">Forgot password?</a>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-[#0891B2] hover:bg-[#067a96] text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
      
      <p className="mt-6 text-center text-gray-600 text-sm">
        Don't have an account? <a href="#" className="text-[#0891B2] font-medium hover:underline">Sign up</a>
      </p>
    </motion.div>
  );
};
export default Login;
`,
    'src/pages/Dashboard.tsx': `
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Main Dashboard Home Page
 */
const Dashboard: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full flex flex-col"
    >
      <h1 className="text-3xl font-bold mb-6">Hello User!</h1>
      
      <div className="grid grid-cols-12 gap-6 flex-1 min-h-0">
        {/* Left Column: 3D Character Viewer Placeholder */}
        <div className="col-span-12 lg:col-span-5 bg-black/40 rounded-2xl border border-gray-800 flex flex-col overflow-hidden relative">
          <div className="absolute inset-0 figma-bg-pattern opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
          <div className="p-4 border-b border-gray-800 relative z-10 flex justify-between items-center bg-[#11222C]/80 backdrop-blur">
            <h2 className="font-semibold text-sm uppercase text-gray-400 tracking-wider">Health Avatar</h2>
            <div className="flex gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
            </div>
          </div>
          <div className="flex-1 flex items-center justify-center relative z-10">
            {/* TODO Phase 2: Add actual CharacterViewer component here */}
            <div className="text-center text-gray-500">
              <div className="w-32 h-32 mx-auto mb-4 border-4 border-dashed border-gray-700 rounded-full flex items-center justify-center">
                <span className="text-4xl">🤖</span>
              </div>
              <p>3D Character Viewport</p>
              <p className="text-sm">(FBX Model loading...)</p>
            </div>
          </div>
        </div>

        {/* Right Column: Chatbot Card */}
        <div className="col-span-12 lg:col-span-7 bg-[#DDD4D8] rounded-2xl flex flex-col overflow-hidden shadow-xl text-gray-900 border-t-4 border-[#0891B2]">
          <div className="p-4 bg-white border-b border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#0891B2] flex items-center justify-center text-white font-bold">M</div>
            <div>
              <h2 className="font-bold text-lg leading-tight">MedBot Assistant</h2>
              <p className="text-xs text-green-600 font-medium">● Online</p>
            </div>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {/* Mock Messages */}
            <div className="flex justify-start">
              <div className="max-w-[80%] bg-white p-3 rounded-2xl rounded-tl-sm shadow-sm">
                <p className="text-sm">Hello! I'm MedBot. How are you feeling today?</p>
              </div>
            </div>
            <div className="flex justify-end">
              <div className="max-w-[80%] bg-[#478768] text-white p-3 rounded-2xl rounded-tr-sm shadow-sm">
                <p className="text-sm">I have a slight headache and my blood pressure feels high.</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex items-center gap-2 bg-gray-100 rounded-full px-4 py-2">
              <input 
                type="text" 
                placeholder="Type your symptoms..."
                className="flex-1 bg-transparent outline-none text-sm"
              />
              <button className="w-8 h-8 rounded-full bg-[#0891B2] text-white flex items-center justify-center hover:bg-[#067a96] transition-colors">
                <span className="sr-only">Send</span>
                ➤
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
export default Dashboard;
`,
    'src/pages/Analytics.tsx': `
import React from 'react';
import { motion } from 'framer-motion';
import { Download, Heart, Activity, Droplets, Droplet } from 'lucide-react';

/**
 * Analytics Page Component
 */
const Analytics: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Health Analytics</h1>
        <button className="flex items-center gap-2 bg-[#DDD4D8] text-gray-900 px-4 py-2 rounded-lg font-medium hover:bg-white transition-colors">
          <Download size={18} />
          Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Col 1: Overview */}
        <div className="space-y-6">
          <div className="bg-[#DDD4D8] p-6 rounded-2xl text-gray-900 border-t-4 border-[#0891B2]">
            <h3 className="font-bold text-xl mb-4">Patient Overview</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden">
                <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Patient" />
              </div>
              <div>
                <p className="font-bold text-lg">John Doe</p>
                <p className="text-sm text-gray-600">ID: MC-792BD012</p>
              </div>
            </div>
            {/* Mock Pie Chart Space */}
            <div className="h-48 bg-white rounded-xl border border-gray-200 flex items-center justify-center flex-col shadow-inner">
              <div className="w-32 h-32 rounded-full border-[12px] border-[#0891B2] border-l-[#16A34A] border-r-gray-200 flex items-center justify-center mb-2">
                <span className="text-2xl font-bold text-[#0891B2]">86</span>
              </div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Health Score</p>
            </div>
          </div>
        </div>

        {/* Cols 2-3: Vitals Grid */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="flex bg-[#233544] p-1 rounded-lg self-end w-max">
            {['Weekly', 'Monthly', 'Yearly'].map((t, i) => (
              <button key={i} className={\`px-4 py-1.5 text-sm rounded-md transition-colors \${i === 0 ? 'bg-[#0891B2] text-white font-medium' : 'text-gray-400 hover:text-white'}\`}>
                {t}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Vitals Cards */}
            <VitalCard title="Heart Rate" value="72 bpm" trend="+2% normal" icon={<Heart size={24} className="text-red-500" />} />
            <VitalCard title="Blood Pressure" value="120/80" trend="Optimal" icon={<Activity size={24} className="text-blue-500" />} />
            <VitalCard title="Blood Glucose" value="98 mg/dL" trend="-5% from last week" icon={<Droplet size={24} className="text-yellow-500" />} />
            <VitalCard title="Oxygen Level" value="99%" trend="Stable" icon={<Droplets size={24} className="text-[#0891B2]" />} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const VitalCard = ({ title, value, trend, icon }: { title: string, value: string, trend: string, icon: React.ReactNode }) => (
  <div className="bg-[#DDD4D8] p-6 rounded-2xl text-gray-900 border border-transparent hover:border-[#0891B2] transition-colors shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
      <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Latest</span>
    </div>
    <h4 className="text-gray-600 text-sm font-medium mb-1">{title}</h4>
    <div className="text-2xl font-bold mb-2">{value}</div>
    <p className="text-sm text-[#478768] font-medium">{trend}</p>
  </div>
);

export default Analytics;
`,
    'src/pages/Chat.tsx': `
import React from 'react';
import { motion } from 'framer-motion';

/**
 * Dedicated AI Chat Page
 */
const Chat: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex gap-6"
    >
      {/* Left: Chat History */}
      <div className="w-64 hidden xl:flex flex-col bg-[#DDD4D8] rounded-2xl text-gray-900 overflow-hidden shadow-lg border-t-4 border-[#0891B2]">
        <div className="p-4 border-b border-gray-300 font-bold">History</div>
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {['Headache consultation', 'Diet plan analysis', 'ECG Report reading'].map((item, i) => (
            <div key={i} className="p-3 hover:bg-white rounded-xl cursor-pointer transition-colors text-sm font-medium border border-transparent hover:border-gray-200">
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Center: Main Chat Area */}
      <div className="flex-1 flex flex-col bg-black/40 rounded-2xl border border-gray-800 overflow-hidden relative">
        {/* Header */}
        <div className="h-16 border-b border-gray-800 bg-[#11222C]/80 backdrop-blur px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-[#0891B2] flex items-center justify-center font-bold">M</div>
             <span className="font-semibold text-white">AI Diagnosis Session</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex-shrink-0"></div>
              <div className="flex-1 bg-[#233544] p-4 rounded-2xl rounded-tl-sm text-gray-100">
                Can you analyze my recent blood test?
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-[#0891B2] flex-shrink-0 flex items-center justify-center font-bold">M</div>
              <div className="flex-1 bg-transparent text-gray-100 space-y-4">
                <p>Based on your provided parameters, here is the analysis:</p>
                <div className="bg-[#11222C] border border-gray-700 rounded-lg p-4 font-mono text-sm">
                  <p className="text-yellow-400">// Cholesterol levels</p>
                  <p>LDL: <span className="text-red-400">140 mg/dL</span> (High)</p>
                  <p>HDL: <span className="text-green-400">55 mg/dL</span> (Normal)</p>
                </div>
                <p>I recommend reducing saturated fats. Would you like a meal plan?</p>
              </div>
            </div>
          </div>
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-800 bg-[#11222C]">
          <div className="max-w-3xl mx-auto flex items-end gap-2 bg-[#233544] p-2 rounded-xl border border-gray-700">
            <button className="p-2 text-gray-400 hover:text-[#0891B2] transition"><span className="text-xl">📎</span></button>
            <textarea 
              rows={1}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent outline-none resize-none py-2 text-gray-100 placeholder-gray-500 max-h-32"
            />
            <button className="p-2 text-gray-400 hover:text-[#16A34A] transition"><span className="text-xl">🎤</span></button>
            <button className="w-10 h-10 rounded-lg bg-[#0891B2] text-white flex items-center justify-center hover:bg-[#067a96] transition-colors ml-2">➤</button>
          </div>
        </div>
      </div>

      {/* Right: Mini Viewer */}
      <div className="w-72 hidden lg:block bg-black/40 rounded-2xl border border-gray-800 overflow-hidden relative">
         <div className="p-4 border-b border-gray-800 text-sm font-semibold text-gray-400 uppercase tracking-wider bg-[#11222C]/80">Snapshot</div>
         <div className="aspect-square bg-gray-900 border-b border-gray-800 flex items-center justify-center text-gray-600 flex-col">
            <span className="text-3xl mb-2">🧊</span>
            <span className="text-xs">3D Mini View</span>
         </div>
         <div className="p-4 space-y-3">
           <div className="flex justify-between text-sm"><span className="text-gray-400">Heart Rate</span><span className="text-white font-medium">72 BPM</span></div>
           <div className="flex justify-between text-sm"><span className="text-gray-400">Status</span><span className="text-[#16A34A] font-medium">Stable</span></div>
         </div>
      </div>
    </motion.div>
  );
};
export default Chat;
`,
    'src/pages/Integration.tsx': `
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, Activity } from 'lucide-react';

/**
 * Integration Page (Data Sources & OCR)
 */
const Integration: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleUpload = () => {
    setIsScanning(true);
    setScanResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("Result: Normal Sinus Rhythm 72 BPM\\nRemarks: No acute abnormalities detected.");
    }, 1500);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8"
    >
      <div className="text-center md:text-left">
        <h1 className="text-3xl font-bold mb-2">Integration</h1>
        <p className="text-gray-400">Connect your data sources for a comprehensive health overview.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload ECG */}
        <UploadCard 
          title="Upload your ECG" 
          icon={<Activity size={40} className="text-[#0891B2]" />}
          onUpload={handleUpload}
        />
        
        {/* Upload Prescription */}
        <UploadCard 
          title="Upload your Prescription" 
          icon={<FileText size={40} className="text-[#16A34A]" />}
          onUpload={handleUpload}
        />
      </div>

      {/* OCR Result Modal/Banner */}
      <AnimatePresence>
        {isScanning && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            exit={{ opacity: 0, height: 0 }}
            className="bg-[#0891B2]/20 border border-[#0891B2] rounded-xl p-6 flex flex-col items-center justify-center overflow-hidden"
          >
             <div className="w-8 h-8 border-4 border-[#0891B2] border-t-transparent rounded-full animate-spin mb-4"></div>
             <p className="text-[#0891B2] font-medium animate-pulse">Scanning document with MedCore AI...</p>
          </motion.div>
        )}
        {scanResult && !isScanning && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#DDD4D8] border-l-4 border-[#16A34A] rounded-xl p-6 text-gray-900 shadow-xl"
          >
             <h3 className="font-bold text-lg mb-2">Scan Complete</h3>
             <pre className="whitespace-pre-wrap font-mono text-sm bg-white p-4 rounded-lg border border-gray-300">
               {scanResult}
             </pre>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="text-center p-4 bg-gray-900/50 rounded-xl border border-gray-800 text-sm text-gray-500">
        🔒 All uploaded documents are end-to-end encrypted and HIPAA compliant.
      </div>
    </motion.div>
  );
};

const UploadCard = ({ title, icon, onUpload }: { title: string, icon: React.ReactNode, onUpload: () => void }) => (
  <div className="bg-[#DDD4D8] rounded-2xl p-8 border-t-4 border-[#0891B2] flex flex-col items-center justify-center text-center shadow-lg hover:shadow-xl transition-shadow cursor-pointer group" onClick={onUpload}>
    <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-6">Drag and drop your files here or click to browse.</p>
    <button className="px-6 py-2 bg-gray-900 text-white rounded-full font-medium flex items-center gap-2 hover:bg-black transition-colors">
      <UploadCloud size={18} />
      Select File
    </button>
  </div>
);

export default Integration;
`,
    'src/pages/Calendar.tsx': `
import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';

/**
 * Calendar Page Component
 */
const Calendar: React.FC = () => {
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-7xl mx-auto"
    >
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Calender <span className="text-xl text-gray-500 font-normal">2026</span></h1>
        <button className="bg-[#0891B2] hover:bg-[#067a96] text-white px-5 py-2.5 rounded-full font-medium transition-colors flex items-center gap-2 shadow-lg shadow-[#0891B2]/20">
          <Plus size={18} />
          Add Reminder
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
        {months.map((month, idx) => (
          <div key={month} className="bg-[#DDD4D8] rounded-2xl p-5 border border-transparent hover:border-[#0891B2] transition-colors shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">{month}</h3>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['S','M','T','W','T','F','S'].map((d, i) => (
                <div key={i} className="text-xs font-semibold text-gray-500">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                // Mock random events
                const hasEvent = Math.random() > 0.85;
                return (
                  <div 
                    key={day} 
                    className={\`aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-colors cursor-pointer
                      \${hasEvent ? 'bg-[#16A34A] text-white font-bold shadow-md hover:bg-[#138e40]' : 'text-gray-700 hover:bg-white'}
                    \`}
                  >
                    {day}
                    {hasEvent && <span className="w-1 h-1 bg-white rounded-full mt-0.5"></span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
export default Calendar;
`,
    'src/pages/Settings.tsx': `
import React, { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Settings Page Component
 */
const Settings: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      <h1 className="text-3xl font-bold tracking-tight">SETTINGS</h1>

      <div className="bg-[#DDD4D8] rounded-2xl p-6 lg:p-8 text-gray-900 shadow-xl border-t-4 border-[#0891B2] space-y-10">
        
        {/* Notifications */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#0891B2] rounded-full inline-block"></span>
            Notifications
          </h2>
          <div className="space-y-4">
            <ToggleRow label="Push Notifications" description="Receive alerts on your device" defaultChecked />
            <ToggleRow label="Email Notifications" description="Daily and weekly health summaries" />
            <ToggleRow label="SMS Alerts" description="Critical alerts for medications" defaultChecked />
          </div>
        </section>

        <hr className="border-gray-300" />

        {/* Privacy */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-[#16A34A] rounded-full inline-block"></span>
            Privacy & Security
          </h2>
          <div className="space-y-4">
             <ToggleRow label="Data Sharing" description="Share anonymous data for research" />
             <div className="pt-2 flex gap-4">
               <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">Manage Permissions</button>
               <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors">Download My Data</button>
             </div>
          </div>
        </section>

        <hr className="border-gray-300" />

        {/* Account */}
        <section>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <span className="w-2 h-6 bg-red-500 rounded-full inline-block"></span>
            Account Management
          </h2>
          <div className="flex flex-col sm:flex-row gap-4">
             <button className="px-5 py-2.5 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors flex-1">Change Password</button>
             <button className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg font-medium hover:bg-red-100 transition-colors flex-1">Delete Account</button>
          </div>
        </section>
      </div>
    </motion.div>
  );
};

const ToggleRow = ({ label, description, defaultChecked = false }: { label: string, description: string, defaultChecked?: boolean }) => {
  const [active, setActive] = useState(defaultChecked);
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-gray-100">
      <div>
        <p className="font-semibold text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <button 
        onClick={() => setActive(!active)}
        className={\`w-12 h-6 rounded-full p-1 transition-colors duration-300 ease-in-out flex \${active ? 'bg-[#0891B2] justify-end' : 'bg-gray-300 justify-start'}\`}
      >
        <motion.div layout className="w-4 h-4 bg-white rounded-full shadow-md" />
      </button>
    </div>
  )
}

export default Settings;
`,
    'src/pages/Profile.tsx': `
import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, AlertCircle } from 'lucide-react';

/**
 * Comprehensive Patient Profile Page
 */
const Profile: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      {/* Header Profile Card */}
      <div className="bg-[#DDD4D8] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden shadow-lg border-t-4 border-[#0891B2]">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#0891B2]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
        
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
            <img src="https://i.pravatar.cc/150?u=a042581f4e29026704d" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <button className="absolute bottom-0 right-0 p-2 bg-[#0891B2] text-white rounded-full shadow-lg hover:bg-[#067a96] transition transform hover:scale-110">
            <Edit2 size={16} />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">John Doe</h1>
              <p className="text-[#0891B2] font-mono font-medium">MC-792BD012</p>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 self-center md:self-start">
               Verified Patient
            </span>
          </div>
          <p className="text-gray-600 max-w-lg mb-6">Patient profile up to date. Last sync 2 hours ago from Apple HealthKit.</p>
          <button className="px-5 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm">
            Edit Profile
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Personal Info */}
        <div className="md:col-span-2 bg-[#DDD4D8] rounded-2xl p-6 lg:p-8 shadow-sm">
           <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-300 pb-2">Personal Information</h3>
           <div className="grid grid-cols-2 gap-y-6 gap-x-4">
              <InfoItem label="Blood Group" value="A+" />
              <InfoItem label="Age" value="28 Years" />
              <InfoItem label="Height" value="178 cm" />
              <InfoItem label="Weight" value="72 kg" />
              <InfoItem label="Emergency Contact" value="+1 (555) 019-2839" />
              <InfoItem label="Primary Physician" value="Dr. Sarah Jenkins" />
           </div>
        </div>

        {/* Medical Tags */}
        <div className="space-y-6">
          <div className="bg-[#DDD4D8] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
               <AlertCircle size={18} className="text-red-500" />
               Allergies
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">Penicillin</span>
              <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-sm font-medium">Peanuts</span>
            </div>
          </div>
          
          <div className="bg-[#DDD4D8] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ongoing Conditions</h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium border border-yellow-200">Mild Asthma</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const InfoItem = ({ label, value }: { label: string, value: string }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
    <p className="text-base font-semibold text-gray-900">{value}</p>
  </div>
);

export default Profile;
`,
    'src/pages/NotFound.tsx': `
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router';

/**
 * 404 Error Page Component
 */
const NotFound: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#11222C] flex flex-col items-center justify-center p-4 text-center overflow-hidden relative">
      <div className="absolute inset-0 figma-bg-pattern opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
      
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", bounce: 0.5 }}
        className="relative z-10"
      >
        <h1 className="text-[150px] font-black text-transparent bg-clip-text bg-gradient-to-b from-gray-700 to-[#11222C] leading-none select-none drop-shadow-2xl">
          404
        </h1>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#0891B2] rounded-full mix-blend-overlay filter blur-3xl opacity-50 animate-pulse"></div>
      </motion.div>
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 mt-8 space-y-6"
      >
        <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">Page Not Found</h2>
        <p className="text-gray-400 max-w-md mx-auto">
          The medical record or page you are looking for does not exist or has been moved.
        </p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="bg-[#0891B2] hover:bg-[#067a96] text-white px-8 py-3 rounded-full font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-[#0891B2]/20"
        >
          Back to Dashboard
        </button>
      </motion.div>
    </div>
  );
};
export default NotFound;
`
};

for (const [file, content] of Object.entries(layouts)) write(file, content);
for (const [file, content] of Object.entries(routes)) write(file, content);
for (const [file, content] of Object.entries(pages)) write(file, content);

console.log("All files created successfully!");
