import React from 'react';
import { motion } from 'framer-motion';
import { Toggle } from '@/components/ui/toggle';
import { mockSettings } from '@/mock/settings';
import { useSettingsStore } from '@/stores/settingsStore';

/**
 * Settings Page Component (Matching Figma Desktop - 6.png)
 * 3 Sections: Notifications, Privacy, Account with interactive toggles and pill action buttons
 */
export const SettingsPage: React.FC = () => {
  const { toggleSetting } = useSettingsStore();

  const handleAction = (itemLabel: string) => {
    alert(`Action triggered for: ${itemLabel}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-w-4xl"
    >
      <div>
        <h1 className="text-3xl font-bold text-white tracking-wide">SETTINGS</h1>
      </div>

      <div className="flex flex-col gap-8">
        {mockSettings.map((section) => (
          <div
            key={section.title}
            className="bg-[#DDD4D8] rounded-3xl p-6 lg:p-8 shadow-xl text-[#11222C] border-t-4 border-[#0891B2]"
          >
            <h2 className="text-2xl font-bold mb-6 tracking-wide text-[#11222C] border-b border-gray-300 pb-3">
              {section.title}
            </h2>

            <div className="flex flex-col gap-6">
              {section.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-200/60 last:border-0"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-lg text-[#11222C]">{item.label}</span>
                    {item.description && (
                      <span className="text-sm text-gray-600 mt-0.5">{item.description}</span>
                    )}
                  </div>

                  {item.controlType === 'toggle' ? (
                    <Toggle
                      checked={Boolean(item.defaultValue ?? true)}
                      onChange={() => toggleSetting(item.id)}
                    />
                  ) : (
                    <button
                      onClick={() => handleAction(item.label)}
                      className={`px-6 py-2 rounded-full font-bold text-sm shadow-md transition-all cursor-pointer ${
                        item.id === 'delete'
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-[#CEC4D0] hover:bg-[#b5a9b8] text-[#11222C]'
                      }`}
                    >
                      {item.buttonLabel || 'Update'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SettingsPage;
