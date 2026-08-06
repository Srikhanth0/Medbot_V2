import { create } from 'zustand';
import { SettingSection } from '../types';

interface SettingsStore {
  sections: SettingSection[];
  toggleSetting: (id: string) => void;
  updateSetting: (id: string, val: any) => void;
}

const initialSections: SettingSection[] = [
  {
    title: 'Notifications',
    items: [
      { id: 'notif_push', label: 'Push Notifications', description: 'Receive push notifications', controlType: 'toggle', defaultValue: true },
      { id: 'notif_email', label: 'Email Notifications', description: 'Receive email notifications', controlType: 'toggle', defaultValue: false }
    ]
  },
  {
    title: 'Privacy',
    items: [
      { id: 'priv_data', label: 'Data Sharing', description: 'Share data with research partners', controlType: 'toggle', defaultValue: false },
      { id: 'priv_delete', label: 'Delete Account', description: 'Permanently delete your account', controlType: 'button', buttonLabel: 'Delete', isDanger: true }
    ]
  }
];

export const useSettingsStore = create<SettingsStore>((set) => ({
  sections: initialSections,
  toggleSetting: (id) => set((state) => ({
    sections: state.sections.map(sec => ({
      ...sec,
      items: sec.items.map(item => 
        item.id === id && item.controlType === 'toggle' 
          ? { ...item, defaultValue: !item.defaultValue } 
          : item
      )
    }))
  })),
  updateSetting: (id, val) => set((state) => ({
    sections: state.sections.map(sec => ({
      ...sec,
      items: sec.items.map(item => item.id === id ? { ...item, defaultValue: val } : item)
    }))
  }))
}));
