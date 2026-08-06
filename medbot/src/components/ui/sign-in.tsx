import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import useAutoLayout from '@/utils/useAutoLayout';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
    <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
    <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
    <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
  </svg>
);

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
}

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-gray-700 bg-white/5 backdrop-blur-sm transition-colors focus-within:border-[#0891B2]">
    {children}
  </div>
);

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <div className="flex items-start gap-3 rounded-3xl bg-[#11222C]/80 backdrop-blur-xl border border-white/10 p-5 w-72 text-white shadow-2xl">
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl shrink-0" alt="avatar" />
    <div className="text-xs leading-snug">
      <p className="font-bold text-white">{testimonial.name}</p>
      <p className="text-gray-400 text-[11px]">{testimonial.handle}</p>
      <p className="mt-1 text-gray-200">{testimonial.text}</p>
    </div>
  </div>
);

export const SignInPage: React.FC<SignInPageProps> = ({
  title = <span className="font-bold text-white tracking-tight">Welcome Back</span>,
  description = "Access your MedBot AI health assistant account",
  heroImageSrc,
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  useAutoLayout();

  return (
    <div className="h-screen w-full flex flex-col md:flex-row bg-[#11222C] text-white overflow-hidden">
      {/* Left column: sign-in form */}
      <section className="flex-1 flex items-center justify-center p-6 md:p-12 pt-20 md:pt-16 overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl md:text-4xl font-bold leading-tight">{title}</h1>
            <p className="text-gray-400 text-sm -mt-2">{description}</p>

            <form className="space-y-4" onSubmit={onSignIn}>
              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Email Address</label>
                <GlassInputWrapper>
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Enter your email address"
                    className="w-full bg-transparent text-sm p-3.5 text-white placeholder-gray-500 rounded-2xl focus:outline-none"
                  />
                </GlassInputWrapper>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      className="w-full bg-transparent text-sm p-3.5 pr-12 text-white placeholder-gray-500 rounded-2xl focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-gray-300">
                  <input type="checkbox" name="rememberMe" className="rounded bg-gray-800 border-gray-700 text-[#0891B2]" />
                  <span>Keep me signed in</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); onResetPassword?.(); }}
                  className="text-cyan-400 hover:underline transition-colors font-medium"
                >
                  Reset password
                </a>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-[#0891B2] hover:bg-[#067a96] py-3.5 font-bold text-white transition-colors cursor-pointer shadow-lg text-sm uppercase tracking-wider mt-1"
              >
                Sign In
              </button>
            </form>

            <div className="relative flex items-center justify-center my-1">
              <span className="w-full border-t border-gray-800"></span>
              <span className="px-4 text-xs text-gray-400 bg-[#11222C] absolute">Or continue with</span>
            </div>

            <button
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-3 border border-gray-700 rounded-2xl py-3 hover:bg-white/5 transition-colors cursor-pointer text-sm font-medium"
            >
              <GoogleIcon />
              Continue with Google
            </button>

            <p className="text-center text-xs text-gray-400">
              New to MedBot?{' '}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); onCreateAccount?.(); }}
                className="text-cyan-400 hover:underline transition-colors font-bold"
              >
                Create Account
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-6 h-full overflow-hidden">
          <div
            className="w-full h-full rounded-3xl bg-cover bg-center border border-gray-800 shadow-2xl relative overflow-hidden"
            style={{ backgroundImage: `url(${heroImageSrc})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#11222C] via-transparent to-transparent opacity-80" />
            {testimonials.length > 0 && (
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-6 w-full justify-center">
                <TestimonialCard testimonial={testimonials[0]} />
                {testimonials[1] && <TestimonialCard testimonial={testimonials[1]} />}
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default SignInPage;
