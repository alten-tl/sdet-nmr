import type { Appointment } from "./appointment";

export interface AppointmentRepository {
  findByDate(date: string): Promise<Appointment[]>;
}