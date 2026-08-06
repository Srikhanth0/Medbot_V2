export type SettingControlType = 'toggle' | 'button';

export interface SettingItem {
  id: string;
  label: string;
  description: string;
  controlType: SettingControlType;
  buttonLabel?: string;
  defaultValue?: boolean | string;
  isDanger?: boolean;
}

export interface SettingSection {
  title: string;
  items: SettingItem[];
}
