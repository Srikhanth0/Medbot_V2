import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import { Edit2, AlertCircle, ShieldCheck, Key, Settings, Palette, Box } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import useModelStore from '@/stores/modelStore';
import { ProfileForm } from '@/components/forms/ProfileForm';

/**
 * Comprehensive Patient & User Profile Page Component
 * Renders patient clinical telemetry, 3D model settings, and persistent Supabase profile synchronization.
 */
export const ProfilePage: React.FC = () => {
  const { user } = useAuthStore();
  const { user: clerkUser } = useUser();
  const { xPosition, yPosition, zoom } = useModelStore();
  const [isEditing, setIsEditing] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl space-y-6 pb-8"
    >
      {/* Header Profile Card at Top of Page */}
      <div className="bg-[#DDD4D8] rounded-3xl p-6 lg:p-8 flex flex-col md:flex-row items-center md:items-start gap-8 relative overflow-hidden shadow-xl border-t-4 border-[#0891B2]">
        <div className="relative group">
          <div className="w-32 h-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
            <img
              src={clerkUser?.imageUrl || user?.avatar || 'https://i.pravatar.cc/150?u=a042581f4e29026704d'}
              alt={user?.name || 'Patient'}
              className="w-full h-full object-cover"
            />
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 p-2.5 bg-[#0891B2] text-white rounded-full shadow-lg hover:bg-[#067a96] transition transform hover:scale-110 cursor-pointer"
            title="Edit Profile Data & Save to Supabase"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left z-10 text-[#11222C]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
            <div>
              <h1 className="text-3xl font-bold text-[#11222C] tracking-wide">
                {user?.name || clerkUser?.fullName || 'Sarah Johnson'}
              </h1>
              <p className="text-gray-600 text-sm font-medium">{user?.email || clerkUser?.primaryEmailAddress?.emailAddress || 'sarah.j@example.com'}</p>
              <p className="text-[#0891B2] font-mono font-bold mt-1 text-xs">
                Medical ID: {user?.medicalId || 'MC-792BD012'}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#16A34A]/20 text-[#16A34A] border border-[#16A34A]/30 self-center md:self-start">
              <ShieldCheck className="w-4 h-4" />
              Verified Patient
            </span>
          </div>

          <p className="text-gray-600 text-xs max-w-lg mb-4">
            Patient profile authenticated via {user?.provider || 'Clerk & Supabase API'}. Active session verified.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-[#11222C] hover:bg-black text-white text-xs font-bold rounded-full transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
            >
              <Edit2 className="w-3.5 h-3.5 text-[#0891B2]" />
              Edit Profile
            </button>
            <span className="text-xs text-gray-500 font-mono">
              Joined: {user?.joinedDate || 'July 24, 2026'}
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Personal Details & System Settings */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Personal & Clinical Details */}
        <div className="md:col-span-2 bg-[#DDD4D8] rounded-3xl p-6 lg:p-8 shadow-xl text-[#11222C] space-y-6">
          <h3 className="text-xl font-bold text-[#11222C] border-b border-gray-300 pb-3 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0891B2]" />
            Personal & Clinical Telemetry
          </h3>
          <div className="grid grid-cols-2 gap-y-5 gap-x-6">
            <InfoItem label="Blood Group" value={user?.bloodGroup || 'A+'} />
            <InfoItem label="Age" value={`${user?.age || 28} Years`} />
            <InfoItem label="Emergency Contact" value={user?.emergencyContact || '+1 (555) 019-2839'} />
            <InfoItem label="Insurance Provider" value={user?.insuranceProvider || 'BlueCross HealthCare'} />
            <InfoItem label="Auth Provider" value={user?.provider || 'Clerk & Supabase API'} />
            <InfoItem label="Last Login Session" value={user?.lastLogin || 'July 24, 2026 - 00:35'} />
          </div>

          {/* Model Settings Summary Card */}
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-gray-300/80 space-y-2 mt-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
              <Box className="w-4 h-4 text-[#0891B2]" />
              Active 3D Model Transformation Settings
            </h4>
            <div className="grid grid-cols-3 gap-4 text-xs font-mono font-bold text-[#11222C]">
              <div>X Offset: <span className="text-[#0891B2]">{xPosition > 0 ? `+${xPosition}` : xPosition}</span></div>
              <div>Y Offset: <span className="text-[#0891B2]">{yPosition > 0 ? `+${yPosition}` : yPosition}</span></div>
              <div>Zoom Scale: <span className="text-[#0891B2]">{zoom.toFixed(1)}x</span></div>
            </div>
          </div>
        </div>

        {/* System Preferences & Conditions */}
        <div className="space-y-6">
          {/* Preferences Card */}
          <div className="bg-[#DDD4D8] rounded-3xl p-6 shadow-xl text-[#11222C] space-y-3">
            <h3 className="text-lg font-bold text-[#11222C] flex items-center gap-2 border-b border-gray-300 pb-2">
              <Settings className="w-5 h-5 text-[#0891B2]" />
              Dashboard Preferences
            </h3>
            <div className="space-y-2 text-xs font-semibold">
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Palette className="w-3.5 h-3.5 text-[#0891B2]" />
                  Theme
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#11222C] text-white text-[11px]">
                  {user?.theme || 'MedBot Dark Navy'}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-gray-600 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#0891B2]" />
                  JWT Session
                </span>
                <span className="text-[#16A34A] font-bold">Active & Secure</span>
              </div>
            </div>
          </div>

          {/* Medical Conditions */}
          <div className="bg-[#DDD4D8] rounded-3xl p-6 shadow-xl text-[#11222C]">
            <h3 className="text-lg font-bold text-[#11222C] mb-3 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Ongoing Conditions & Allergies
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold border border-red-300">
                Penicillin
              </span>
              {(user?.conditions || ['Mild Asthma', 'Sinusitis']).map((cond) => (
                <span
                  key={cond}
                  className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-300"
                >
                  {cond}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal (Saves to Supabase Database with User ID) */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#11222C] border border-gray-700 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <Edit2 className="w-5 h-5 text-[#0891B2]" />
              Edit Patient Profile & Save to Supabase
            </h2>
            <ProfileForm onSuccess={() => setIsEditing(false)} />
          </div>
        </div>
      )}
    </motion.div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: string }) => (
  <div>
    <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
    <p className="text-base font-bold text-[#11222C]">{value}</p>
  </div>
);

export default ProfilePage;
