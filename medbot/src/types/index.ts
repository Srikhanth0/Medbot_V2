export * from "./auth";
export * from "./patient";
export * from "./vitals";
export * from "./chat";
export * from "./calendar";
export * from "./settings";

export interface PieSlice {
  name: string;
  value: number;
  color: string;
}

export interface UploadZone {
  id: string;
  title: string;
  subtitle: string;
  acceptedFormats: string[];
}
