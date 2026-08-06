import * as React from "react";

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
}

export function FeatureCard({ title, description, icon }: FeatureCardProps) {
  return (
    <div className="group rounded-3xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md hover:border-cyan-200">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-cyan-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[#11222C]">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
