import { Pool } from "pg";
import { ConflictError, type Appointment, type NewAppointment } from "../domain/appointment";
import type { AppointmentRepository } from "../domain/appointment-repository";

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

const COLUMNS = `
  id,
  customer_id AS "customerId",
  vehicle_id AS "vehicleId",
  appointment_date::text AS "date",
  appointment_time::text AS "time",
  comments,
  status,
  created_at AS "createdAt",
  updated_at AS "updatedAt"
`;

//UNIQUE_CONSTRAINT_VIOLATION FOR POSTGRES IS 23505
const UNIQUE_CONSTRAINT_VIOLATION = "23505";

const slotConfictError = (error: unknown): never => {
    if (error instanceof Error && (error as any).code === UNIQUE_CONSTRAINT_VIOLATION) {
        throw new ConflictError("Slot already taken");
    }
    throw error;
}

export class PostgresAppointmentRepository implements AppointmentRepository {

    async findByDate(date: string): Promise<Appointment[]> {
        const result = await pool.query(
            `SELECT ${COLUMNS} FROM appointments WHERE appointment_date = $1 ORDER BY appointment_time`,
            [date]
        );
        return result.rows;
    }

    async findById(id: number): Promise<Appointment | null> {
        const result = await pool.query(
            `SELECT ${COLUMNS} FROM appointments WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }

    async customerExists(customerId: number): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM customers WHERE id = $1`,
            [customerId]
        );
        return result.rows.length > 0;
    }

    async vehicleBelongsToCustomer(vehicleId: number, customerId: number): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM vehicles WHERE id = $1 AND customer_id = $2`,
            [vehicleId, customerId]
        );
        return result.rows.length > 0;
    }

    async isSlotTaken(date: string, time: string, excludedId?: number): Promise<boolean> {
        const result = await pool.query(
            `SELECT 1 FROM appointments 
             WHERE appointment_date = $1 
             AND appointment_time = $2 
             AND status = 'ENABLED'
             AND ($3::int IS NULL OR id <> $3)`,
            [date, time, excludedId ?? null]
        );
        return result.rows.length > 0;
    }

    async create(appointment: NewAppointment): Promise<Appointment> {
        try {
            const result = await pool.query(
                `INSERT INTO appointments (customer_id, vehicle_id, appointment_date, appointment_time, comments)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING ${COLUMNS}`,
                [
                    appointment.customerId,
                    appointment.vehicleId,
                    appointment.date, appointment.time,
                    appointment.comments
                ]
            );
            return result.rows[0];

        } catch (error: any) {
            // if (error.code === UNIQUE_CONSTRAINT_VIOLATION) {
            //     throw new ConflictError("Slot already taken");
            // }
            // throw error;
            return slotConfictError(error);
        }
    }

    async updateSchedule(id: number, date: string, time: string): Promise<Appointment> {
        try {
            const result = await pool.query(
                `UPDATE appointments 
             SET appointment_date = $1, appointment_time = $2, updated_at = NOW()
             WHERE id = $3
             RETURNING ${COLUMNS}`,
                [date, time, id]
            );

            return result.rows[0];

        } catch (error) {
            return slotConfictError(error);
        }
    }
}


