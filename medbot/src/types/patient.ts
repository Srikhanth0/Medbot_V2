export interface Patient {
  id: string;
  name: string;
  bloodType: string;
  age: number;
  avatarUrl?: string;
  healthScore: number;
  primaryDoctor: string;
}
