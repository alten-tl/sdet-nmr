import type { Appointment, NewAppointment } from "./appointment";

export interface AppointmentRepository {
  findByDate(date: string): Promise<Appointment[]>;
  customerExists(customerId: number): Promise<boolean>;
  vehicleBelongsToCustomer(vehicleId: number, customerId: number): Promise<boolean>;
  isSlottaken(date: string, time: string): Promise<boolean>;
  create(appointment: NewAppointment): Promise<Appointment>;
}