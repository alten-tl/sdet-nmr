import type { Appointment, NewAppointment } from "./appointment";

export interface AppointmentRepository {
  findByDate(date: string): Promise<Appointment[]>;
  findById(id: number): Promise<Appointment | null>;
  customerExists(customerId: number): Promise<boolean>;
  vehicleBelongsToCustomer(vehicleId: number, customerId: number): Promise<boolean>;
  isSlotTaken(date: string, time: string, excludeId?: number): Promise<boolean>;
  create(appointment: NewAppointment): Promise<Appointment>;
  updateSchedule(id: number, date: string, time: string): Promise<Appointment>;
}