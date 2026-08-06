import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SignIn, useUser } from '@clerk/clerk-react';
import { Testimonial } from '@/components/ui/sign-in';
import { useAuthStore } from '@/stores/authStore';
import useAutoLayout from '@/utils/useAutoLayout';
import { extractUserFromClerk, isEmailVerified } from '@/lib/auth/session';
import SupabaseSyncService from '@/lib/supabase/syncService';

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    name: "Dr. Sarah Vance",
    handle: "@drsarah_cardio",
    text: "MedBot AI has revolutionized patient monitoring and real-time vital analysis in our clinical workflow."
  },
  {
    avatarSrc: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    name: "Alex Rivera",
    handle: "@arivera_health",
    text: "The seamless integration of ECG scans and daily health metrics makes tracking physiological data effortless."
  }
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { user: clerkUser } = useUser();
  useAutoLayout();

  React.useEffect(() => {
    if (clerkUser && isEmailVerified(clerkUser)) {
      const userPayload = extractUserFromClerk(clerkUser);
      login(userPayload);
      SupabaseSyncService.syncUserToSupabase(userPayload);
      navigate('/dashboard');
    }
  }, [clerkUser, login, navigate]);

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#11222C] text-white overflow-hidden">
      {/* Left column: Clerk official SignIn component */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 pt-20 md:pt-16 overflow-y-auto">
        <div className="w-full max-w-md my-auto flex justify-center">
          <SignIn
            routing="hash"
            signUpUrl="/signup"
            forceRedirectUrl="/dashboard"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              elements: {
                card: "bg-[#11222C]/90 border border-gray-800 shadow-2xl rounded-3xl p-6 text-white",
                headerTitle: "text-2xl font-bold text-white",
                headerSubtitle: "text-gray-400 text-xs",
                formButtonPrimary: "bg-[#0891B2] hover:bg-[#067a96] text-white font-bold rounded-2xl py-3 text-sm transition-colors shadow-lg",
                formFieldInput: "bg-white/5 border border-gray-700 rounded-2xl p-3 text-white text-sm focus:border-[#0891B2]",
                footerActionLink: "text-[#0891B2] font-bold hover:underline",
                formFieldLabel: "text-gray-300 text-xs font-semibold uppercase tracking-wider",
                dividerLine: "bg-gray-700",
                dividerText: "text-gray-400 text-xs bg-[#11222C]",
                socialButtonsBlockButton: "border border-gray-700 bg-white/5 hover:bg-white/10 text-white rounded-2xl",
              }
            }}
          />
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      <section className="hidden md:block flex-1 relative p-6 h-full overflow-hidden">
        <div
          className="w-full h-full rounded-3xl bg-cover bg-center border border-gray-800 shadow-2xl relative overflow-hidden"
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=2160&q=80')` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#11222C] via-transparent to-transparent opacity-80" />
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-6 w-full justify-center">
            {testimonials.map((t, idx) => (
              <div key={idx} className="flex items-start gap-3 rounded-3xl bg-[#11222C]/80 backdrop-blur-xl border border-white/10 p-5 w-72 text-white shadow-2xl">
                <img src={t.avatarSrc} className="h-10 w-10 object-cover rounded-2xl shrink-0" alt="avatar" />
                <div className="text-xs leading-snug">
                  <p className="font-bold text-white">{t.name}</p>
                  <p className="text-gray-400 text-[11px]">{t.handle}</p>
                  <p className="mt-1 text-gray-200">{t.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
