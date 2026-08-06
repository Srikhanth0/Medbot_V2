import type { UploadZone } from "@/types";

export const mockUploadZones: UploadZone[] = [
  { id: "ecg", title: "Upload your ECG", subtitle: "ECG Data File", acceptedFormats: [".pdf", ".png", ".jpg"] },
  { id: "prescription", title: "Upload your Prescription", subtitle: "prescription Data File", acceptedFormats: [".pdf", ".png", ".jpg"] },
];
