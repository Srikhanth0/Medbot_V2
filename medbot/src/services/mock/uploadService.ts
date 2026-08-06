export const uploadService = {
  processFile: async (type: 'ecg' | 'prescription'): Promise<{ summary: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (type === 'ecg') {
          resolve({
            summary: "ECG Findings: Normal Sinus Rhythm, Heart Rate 72 BPM, PR Interval 0.16s, QRS Duration 0.08s. No ST-segment elevation or T-wave inversion detected.",
          });
        } else {
          resolve({
            summary: "Prescription Extracted: Amoxicillin 500mg (Take 1 capsule every 8 hours for 7 days), Paracetamol 650mg (Take as needed for fever). Prescribed by Dr. Amanda Vance.",
          });
        }
      }, 1500);
    });
  },
  processDocument: async (file: File): Promise<any> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          type: file.type.includes('image') ? 'ECG' : 'Prescription',
          insights: [
            "Normal Sinus Rhythm detected",
            "Heart Rate: 72 bpm within normal limits",
          ],
          confidenceScore: 0.94,
        });
      }, 1500);
    });
  },
};

export const mockUploadService = uploadService;
