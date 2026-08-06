import * as React from "react";
import { Link } from "react-router-dom";
import { Search, Bell, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useNotificationStore } from "@/stores/notificationStore";

interface TopHeaderProps {
  title?: string;
}

export function TopHeader({ title }: TopHeaderProps) {
  const user = useAuthStore((state) => state.user);
  const unreadCount = useNotificationStore((state) => state.unreadCount);

  return (
    <header className="w-full flex flex-col relative shrink-0 z-20">
      {/* Cyan top border accent line */}
      <div className="h-1 w-full bg-[#0891B2]" />

      <div className="flex items-center justify-between px-8 py-4 bg-[#11222C]">
        {/* Title / Search */}
        <div className="flex items-center gap-6">
          {title ? (
            <h1 className="text-2xl font-bold text-white tracking-wide">{title}</h1>
          ) : (
            <div className="relative w-64 hidden sm:block">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search metrics, reports..."
                className="w-full pl-9 pr-4 py-2 bg-[#122B36] text-white text-sm rounded-xl border border-gray-700 focus:outline-none focus:border-[#0891B2] transition-colors"
              />
            </div>
          )}
        </div>

        {/* Right Action Icons & User Badge */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="relative p-2 rounded-xl bg-[#122B36] text-gray-300 hover:text-white transition-colors border border-gray-700">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {/* User Badge with Generic Icon Avatar */}
          <Link
            to="/profile"
            className="bg-[#D4CEE0] rounded-full px-4 py-1.5 flex items-center gap-3 shadow-sm hover:bg-[#c6bdd4] transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-[#11222C] flex items-center justify-center text-cyan-300 overflow-hidden shrink-0 shadow-sm">
              <UserIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] leading-tight text-[#11222C]/70">Good Morning !</span>
              <span className="text-sm font-bold leading-tight text-[#11222C]">
                {user?.name || "User"}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
export default TopHeader;
