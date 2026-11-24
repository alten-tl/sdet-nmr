import { ConflictError, NotFoundError, ValidationError, isValidDate, isValidTime } from "../domain/appointment";
import type { Appointment, NewAppointment } from "../domain/appointment";
import type { AppointmentRepository } from "../domain/appointment-repository";

export class AppointmentService {
    constructor(private readonly repository: AppointmentRepository) { }
    //-------------------------------------------------------
    async listByDate(date: string): Promise<Appointment[]> {
        if (!isValidDate(date)) {
            throw new ValidationError("date is required with the format YYYY-MM-DD");
        }
        return this.repository.findByDate(date);
    }
    //-------------------------------------------------------
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
        if (await this.repository.isSlotTaken(input.date, input.time)) {
            throw new ConflictError("The time slot is already taken for the selected date");
        }

        return this.repository.create(input);
    }
    //-------------------------------------------------------
    async reschedule(id: number, date: string, time?: string): Promise<Appointment> {
        // if (!Number.isInteger(id)) {
        //     throw new ValidationError("appointment id must be an integer");
        // }
        if (!isValidDate(date)) {
            throw new ValidationError("date is required with the format YYYY-MM-DD");
        }
        if (time !== undefined && !isValidTime(time)) {
            throw new ValidationError("time is required with the format HH:MM");
        }

        const appointment = await this.findExisting(id);
        // if (!appointment) {
        //     throw new NotFoundError("Appointment not found");
        // }

        if (appointment.status === "DISABLED") {
            throw new ConflictError("Cannot reschedule a disabled appointment");
        }

        const newTime = time ?? appointment.time;
        await this.ensureSlotIsFree(date, newTime, id);

        return this.repository.updateSchedule(id, date, newTime);
    }

    //-------------------------------------------------------

    async cancel(id: number): Promise<Appointment> {
        const appointment = await this.findExisting(id);

        if (appointment.status === "DISABLED") {
            throw new ConflictError("Appointment is already canceled");
        }

        return this.repository.cancel(id);
    }

    //-------------------------------------------------------
    private async ensureSlotIsFree(date: string, time: string, excludedId?: number): Promise<void> {
        if (await this.repository.isSlotTaken(date, time, excludedId)) {
            throw new ConflictError("The time slot is already taken");
        }
    }

    private async findExisting(id: number): Promise<Appointment> {
        if (!Number.isInteger(id)) {
            throw new ValidationError("appointmentId must be an integer");
        }
        const appointment = await this.repository.findById(id);
        if (!appointment) {
            throw new NotFoundError("Appointment not found");
        }
        return appointment;
    }

}