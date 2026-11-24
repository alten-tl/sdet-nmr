import { Pool } from "pg";
import type { Appointment } from "../domain/appointment";
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

export class PostgresAppointmentRepository implements AppointmentRepository {
    async findByDate(date: string): Promise<Appointment[]> {
        const result = await pool.query(
            `SELECT ${COLUMNS} FROM appointments WHERE appointment_date = $1 ORDER BY appointment_time`,
            [date]
        );
        return result.rows;
    }
}


