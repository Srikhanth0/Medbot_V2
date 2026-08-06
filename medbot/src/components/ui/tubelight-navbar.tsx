import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

export interface NavItem {
  name: string;
  url: string;
  icon: LucideIcon;
}

interface NavBarProps {
  items: NavItem[];
  className?: string;
  color?: string;
}

export function NavBar({ items, className, color = "#4B936A" }: NavBarProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname);

  useEffect(() => {
    setActiveTab(location.pathname);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-3 bg-[#11222C]/40 border border-gray-700/50 backdrop-blur-lg py-3 px-2 rounded-2xl shadow-xl",
        className
      )}
    >
      {items.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.url || (item.url === "/dashboard" && activeTab === "/dashboard/");

        return (
          <Link
            key={item.name}
            to={item.url}
            onClick={() => setActiveTab(item.url)}
            className={cn(
              "relative cursor-pointer text-sm font-semibold p-3 rounded-full transition-colors flex items-center justify-center w-12 h-12",
              "text-gray-300 hover:text-white",
              isActive && "text-white font-bold"
            )}
            title={item.name}
          >
            <Icon size={22} strokeWidth={2.2} className="relative z-10" />
            {isActive && (
              <motion.div
                layoutId="lamp"
                className="absolute inset-0 w-full h-full rounded-full -z-10"
                style={{ backgroundColor: `${color}33` }}
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                }}
              >
                <div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-1 rounded-t-full"
                  style={{ backgroundColor: color }}
                >
                  <div
                    className="absolute w-10 h-5 rounded-full blur-md -top-2 -left-2"
                    style={{ backgroundColor: `${color}66` }}
                  />
                  <div
                    className="absolute w-6 h-4 rounded-full blur-sm -top-1"
                    style={{ backgroundColor: `${color}88` }}
                  />
                </div>
              </motion.div>
            )}
          </Link>
        );
      })}
    </div>
  );
}

export default NavBar;
