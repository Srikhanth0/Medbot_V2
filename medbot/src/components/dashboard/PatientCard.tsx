import * as React from "react";
import type { Patient } from "@/types/patient";

interface PatientCardProps {
  patient?: Patient;
  name?: string;
  id?: string;
  bloodType?: string;
  age?: number;
  avatarSrc?: string;
}

export function PatientCard({
  patient,
  name = patient?.name || "Patient Name",
  id = patient?.id || "MC-792BD012",
  bloodType = patient?.bloodType || "A+",
  age = patient?.age || 28,
  avatarSrc = patient?.avatarUrl || "https://i.pravatar.cc/150?u=a042581f4e29026704d",
}: PatientCardProps) {
  return (
    <div className="bg-[#DDD4D8] rounded-3xl p-6 flex flex-col items-center shadow-lg border border-gray-300 text-[#11222C]">
      {/* Avatar Circle */}
      <div className="w-24 h-24 rounded-full overflow-hidden mb-4 border-4 border-white shadow-md bg-gray-200">
        <img
          src={avatarSrc}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Patient Name & ID */}
      <h2 className="text-2xl font-bold text-[#11222C] tracking-wide">{name}</h2>
      <p className="text-xs font-bold text-gray-500 mb-6">{id}</p>

      {/* Details Grid */}
      <div className="w-full grid grid-cols-2 gap-4 border-t border-gray-300/80 pt-4">
        <div className="text-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Blood
          </p>
          <p className="font-bold text-[#11222C] text-xl">{bloodType}</p>
        </div>
        <div className="text-center border-l border-gray-300/80">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            Age
          </p>
          <p className="font-bold text-[#11222C] text-xl">{age}</p>
        </div>
      </div>
    </div>
  );
}

export default PatientCard;
