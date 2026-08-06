import * as React from "react";
import { Link } from "react-router-dom";
import { Home, BarChart2, LayoutGrid, Settings, Calendar, User } from "lucide-react";
import { NavBar } from "@/components/ui/tubelight-navbar";

const NAV_ITEMS = [
  { url: "/dashboard", icon: Home, name: "Home" },
  { url: "/dashboard/analytics", icon: BarChart2, name: "Analytics" },
  { url: "/dashboard/integration", icon: LayoutGrid, name: "Integration" },
  { url: "/dashboard/settings", icon: Settings, name: "Settings" },
  { url: "/dashboard/calendar", icon: Calendar, name: "Calendar" },
];

export function Sidebar() {
  return (
    <aside className="w-[80px] h-screen bg-[#DDD4D8] rounded-l-2xl sm:rounded-l-2xl sm:rounded-r-none flex flex-col items-center py-6 shrink-0 relative shadow-lg z-30 justify-between">
      {/* Top Left Logo: Group 18.png image without text */}
      <Link to="/dashboard" className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#11222C] p-2 shadow-md hover:scale-105 transition-transform cursor-pointer">
        <img
          src="/group-18.png"
          alt="MedBot Logo"
          className="w-full h-full object-contain"
        />
      </Link>

      {/* Tubelight Navigation Stack with color #4B936A */}
      <div className="my-auto">
        <NavBar items={NAV_ITEMS} color="#4B936A" />
      </div>

      {/* User Profile Avatar Link at Bottom - Generic Icon Avatar */}
      <div className="mt-auto pt-4">
        <Link
          to="/profile"
          className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#11222C] text-white border-2 border-white shadow-md hover:scale-105 transition-transform"
          title="Profile"
        >
          <User className="w-6 h-6 text-cyan-300" />
        </Link>
      </div>
    </aside>
  );
}

export default Sidebar;
