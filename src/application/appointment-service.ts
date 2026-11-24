import { ConflictError, NotFoundError, ValidationError, isValidDate, isValidTime } from "../domain/appointment";
import type { Appointment, NewAppointment } from "../domain/appointment";
import type { AppointmentRepository } from "../domain/appointment-repository";

export class AppointmentService {
    constructor(private readonly repository: AppointmentRepository) { }

    async listByDate(date: string): Promise<Appointment[]> {
        if (!isValidDate(date)) {
            throw new ValidationError("date is required with the format YYYY-MM-DD");
        }
        return this.repository.findByDate(date);
    }

    async create(input: NewAppointment): Promise<Appointment> {
        if (!Number.isInteger(input.customerId) || !Number.isInteger(input.vehicleId)) {
            throw new ValidationError("customerId and vehicleId must be integers");
        }
        if (!isValidDate(input.date)) {
            throw new ValidationError("date is required with the format YYYY-MM-DD");
        }
        if (!isValidTime(input.time)) {
            throw new ValidationError("time is required with the format HH:MM");
        }
        if (!(await this.repository.customerExists(input.customerId))) {
            throw new NotFoundError("Customer not found");
        }
        if (!(await this.repository.vehicleBelongsToCustomer(input.vehicleId, input.customerId))) {
            throw new NotFoundError("vehicleId not found for this customer");
        }
        if (await this.repository.isSlottaken(input.date, input.time)) {
            throw new ConflictError("The time slot is already taken for the selected date");
        }

        return this.repository.create(input);
    }
}