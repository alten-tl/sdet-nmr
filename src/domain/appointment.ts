export type AppointmentStatus = "ENABLED" | "DISABLED";

export interface Appointment {
  id: number;
  customerId: number;
  vehicleId: number;
  date: string;
  time: string;
  comments: string | null;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class ValidationError extends Error { }

export const isValidDate = (value: string): boolean => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(value);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
};