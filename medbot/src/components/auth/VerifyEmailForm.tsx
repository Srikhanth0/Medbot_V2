import React, { useState, useEffect } from 'react';
import { useSignUp, useUser, useAuth } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { Mail, ShieldCheck } from 'lucide-react';
import { formatAuthError } from '@/lib/auth/errorUtils';
import { isEmailVerified, extractUserFromClerk } from '@/lib/auth/session';
import { useAuthStore } from '@/stores/authStore';
import SupabaseSyncService from '@/lib/supabase/syncService';

interface VerifyEmailFormProps {
  email: string;
  userName?: string;
  onSuccess?: () => void;
}

export const VerifyEmailForm: React.FC<VerifyEmailFormProps> = ({ email, userName, onSuccess }) => {
  const navigate = useNavigate();
  const { signUp, isLoaded, setActive } = useSignUp();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  const { login } = useAuthStore();
  const [code, setCode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Step 4: Check if email is already verified on mount to prevent duplicate execution
  useEffect(() => {
    if (isEmailVerified(clerkUser) || signUp?.status === 'complete') {
      setStatusMsg('Your email has already been verified. Redirecting you to your dashboard...');
      const timer = setTimeout(() => {
        if (clerkUser) {
          const userObj = extractUserFromClerk(clerkUser);
          login(userObj);
        }
        navigate('/dashboard');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [clerkUser, signUp?.status, login, navigate]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setStatusMsg('');
    setIsLoading(true);

    if (!isLoaded || !signUp) {
      setErrorMsg('Verification service is initializing. Please wait.');
      setIsLoading(false);
      return;
    }

    // Step 4: NEVER verify an already verified user or complete signup
    if (signUp.status === 'complete' || isEmailVerified(clerkUser)) {
      setStatusMsg('Your email has already been verified. Redirecting to your dashboard...');
      setTimeout(() => navigate('/dashboard'), 800);
      setIsLoading(false);
      return;
    }

    try {
      const result = await signUp.attemptEmailAddressVerification({ code });

      if (result.status === 'complete' && setActive) {
        await setActive({ session: result.createdSessionId });

        const newUserPayload = {
          id: result.createdUserId || 'usr_' + Date.now(),
          name: userName || email.split('@')[0],
          email: email,
          role: 'patient',
          bloodGroup: 'A+',
          age: 28,
          medicalId: 'MC-792BD012',
          emergencyContact: '+1 (555) 019-2834',
          conditions: [],
          insuranceProvider: 'BlueCross Health',
          provider: 'Clerk Verified Email',
        };

        login(newUserPayload);
        const token = await getToken({ template: 'supabase' });
        await SupabaseSyncService.syncUserToSupabase(newUserPayload, token || undefined);

        if (onSuccess) onSuccess();
        navigate('/dashboard');
      } else {
        setErrorMsg('Verification is incomplete. Please check the code and try again.');
      }
    } catch (err: any) {
      const formatted = formatAuthError(err);
      const rawText = err.errors?.[0]?.longMessage || err.message || '';

      // Step 4: Handle "already verified" error gracefully without showing an error box
      if (rawText.includes('already verified') || rawText.includes('already completed')) {
        setStatusMsg('Your email address has already been verified. Redirecting to your dashboard...');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setErrorMsg(formatted);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-md w-full">
      <div className="w-12 h-12 rounded-2xl bg-[#0891B2]/20 border border-[#0891B2]/40 flex items-center justify-center text-[#0891B2]">
        <Mail className="w-6 h-6" />
      </div>
      <h1 className="text-3xl font-bold">Verify Your Email</h1>
      <p className="text-gray-300 text-xs leading-relaxed">
        We sent a 6-digit verification code to <span className="text-cyan-400 font-bold">{email}</span>. Enter it below to activate your account.
      </p>

      {errorMsg && (
        <div className="p-3.5 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-300 text-xs font-semibold">
          {errorMsg}
        </div>
      )}

      {statusMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          {statusMsg}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-4 mt-2">
        <div>
          <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Verification Code</label>
          <input
            type="text"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full bg-white/5 border border-gray-700 rounded-2xl p-4 text-center text-2xl font-mono tracking-widest text-white focus:border-[#0891B2] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-[#0891B2] hover:bg-[#067a96] py-3.5 font-bold text-white transition-colors cursor-pointer shadow-lg text-sm uppercase tracking-wider flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <ShieldCheck className="w-4 h-4" />
          {isLoading ? 'Verifying...' : 'Verify Email & Enter Dashboard'}
        </button>
      </form>
    </div>
  );
};

export default VerifyEmailForm;
