import * as React from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";
import SupabaseSyncService from "@/lib/supabase/syncService";

interface ProfileFormProps {
  onSuccess?: () => void;
}

export function ProfileForm({ onSuccess }: ProfileFormProps) {
  const { user, updateProfile, login } = useAuthStore();
  const { user: clerkUser } = useUser();
  const { getToken } = useAuth();
  
  const [name, setName] = React.useState(user?.name || clerkUser?.fullName || "Sarah Johnson");
  const [bloodGroup, setBloodGroup] = React.useState(user?.bloodGroup || "A+");
  const [age, setAge] = React.useState(user?.age || 28);
  const [emergencyContact, setEmergencyContact] = React.useState(
    user?.emergencyContact || "+1 (555) 019-2839"
  );
  const [insuranceProvider, setInsuranceProvider] = React.useState(
    user?.insuranceProvider || "BlueCross HealthCare"
  );
  const [isLoading, setIsLoading] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg("");

    const userId = user?.id || clerkUser?.id || "usr_" + Date.now();
    const updatedPayload = {
      ...user,
      id: userId,
      name,
      email: user?.email || clerkUser?.primaryEmailAddress?.emailAddress || "sarah.j@example.com",
      role: user?.role || "patient",
      bloodGroup,
      age: Number(age),
      medicalId: user?.medicalId || "MC-792BD012",
      emergencyContact,
      insuranceProvider,
      conditions: user?.conditions || ["Mild Asthma", "Sinusitis"],
      provider: "Clerk & Supabase (Persistent)",
    };

    // 1. Update Zustand store & LocalStorage immediately
    updateProfile(updatedPayload);
    login(updatedPayload);

    // 2. Update Clerk unsafeMetadata if clerkUser is logged in
    if (clerkUser) {
      try {
        await clerkUser.update({
          unsafeMetadata: {
            ...clerkUser.unsafeMetadata,
            name,
            bloodGroup,
            age: Number(age),
            emergencyContact,
            insuranceProvider,
          }
        });
      } catch (e) {
        console.warn("Clerk metadata update notice:", e);
      }
    }

    // 3. Save user data into Supabase along with user ID
    try {
      const token = await getToken({ template: "supabase" });
      await SupabaseSyncService.syncUserToSupabase(updatedPayload, token || undefined);
      setStatusMsg("Profile saved to Supabase & persistent storage!");
      setTimeout(() => {
        if (onSuccess) onSuccess();
      }, 500);
    } catch (err) {
      console.warn("Supabase save notice:", err);
      if (onSuccess) onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-4 text-white" onSubmit={handleSubmit}>
      {statusMsg && (
        <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
          {statusMsg}
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-300">Full Name</label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-[#122B36] border border-gray-700 text-white"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-300">Blood Group</label>
          <Input
            value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            className="bg-[#122B36] border border-gray-700 text-white"
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-gray-300">Age</label>
          <Input
            type="number"
            value={age}
            onChange={(e) => setAge(Number(e.target.value))}
            className="bg-[#122B36] border border-gray-700 text-white"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-300">Emergency Contact</label>
        <Input
          value={emergencyContact}
          onChange={(e) => setEmergencyContact(e.target.value)}
          className="bg-[#122B36] border border-gray-700 text-white"
          required
        />
      </div>

      <div className="space-y-1">
        <label className="text-xs font-bold text-gray-300">Insurance Provider</label>
        <Input
          value={insuranceProvider}
          onChange={(e) => setInsuranceProvider(e.target.value)}
          className="bg-[#122B36] border border-gray-700 text-white"
        />
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onSuccess}
          className="border-gray-700 text-gray-300"
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? "Saving to Supabase..." : "Save Profile & Sync to Database"}
        </Button>
      </div>
    </form>
  );
}

export default ProfileForm;
