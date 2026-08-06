import type { SettingSection } from "@/types/settings";

export const mockSettings: SettingSection[] = [
  {
    title: "Notifications",
    items: [
      { id: "push", label: "Push Notifications", description: "Get notified on your device.", controlType: "toggle", defaultValue: true },
      { id: "email", label: "Email Notifications", description: "Receive daily email summaries.", controlType: "toggle", defaultValue: true }
    ]
  },
  {
    title: "Privacy",
    items: [
      { id: "data", label: "Data Sharing", description: "Manage what data is shared.", controlType: "button", buttonLabel: "Manage" },
      { id: "privacy", label: "Privacy Settings", description: "Update your privacy preferences.", controlType: "button", buttonLabel: "Update" }
    ]
  },
  {
    title: "Account",
    items: [
      { id: "personal", label: "Personal Information", description: "View or update your info.", controlType: "button", buttonLabel: "Update" },
      { id: "password", label: "Change Password", description: "Secure your account.", controlType: "button", buttonLabel: "Change" },
      { id: "delete", label: "Delete Account", description: "Permanently delete your account.", controlType: "button", buttonLabel: "Delete" }
    ]
  }
];
