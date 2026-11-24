import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PostgresAppointmentRepository } from "./infrastructure/postgres-appointment-repository";
import { AppointmentService } from "./application/appointment-service";
import { ValidationError } from "./domain/appointment";

const service = new AppointmentService(new PostgresAppointmentRepository());

const response = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    if (event.httpMethod === "GET" && event.path === "/appointments") {
      const date = event.queryStringParameters?.date ?? "";
      return response(200, await service.listByDate(date));
    }
    return response(404, { message: "Not Found" });
  } catch (error) {

    if (error instanceof ValidationError) {
      return response(400, { message: error.message });
    }

    return response(500, { message: "Internal Server Error" });

  }
};