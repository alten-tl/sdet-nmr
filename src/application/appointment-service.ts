import { ValidationError, isValidDate } from "../domain/appointment";
import type { Appointment } from "../domain/appointment";
import type { AppointmentRepository } from "../domain/appointment-repository";

export class AppointmentService {
    constructor(private readonly repository: AppointmentRepository) { }

    async listByDate(date: string): Promise<Appointment[]> {
        if (!isValidDate(date)) {
            throw new ValidationError("date is required with the format YYYY-MM-DD");
        }
        return this.repository.findByDate(date);
    }
}