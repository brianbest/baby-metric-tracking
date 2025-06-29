export interface Baby {
  id: string;
  name: string;
  birthDate: Date;
  preferredUnits: 'metric' | 'imperial';
  createdAt: Date;
  updatedAt: Date;
} 