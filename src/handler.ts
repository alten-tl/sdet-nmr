import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { PostgresAppointmentRepository } from "./infrastructure/postgres-appointment-repository";
import { AppointmentService } from "./application/appointment-service";
import { ConflictError, NotFoundError, ValidationError } from "./domain/appointment";

const service = new AppointmentService(new PostgresAppointmentRepository());

//response structure for API Gateway
const response = (statusCode: number, body: unknown): APIGatewayProxyResult => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

//validate JSON 
const parseBody = (body: string | null): Record<string, unknown> => {
  try {
    const parsed = JSON.parse(body ?? "{}");
    return typeof parsed === "object" && parsed !== null ? parsed : {};
  } catch (e) {
    throw new ValidationError("The request body is not a valid JSON");
  }
}

const statusFor = (error: unknown): number => {
  if (error instanceof ValidationError) return 400;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof ConflictError) return 409;

  return 500;
}

//handler function for AWS Lambda
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    //-------------------------------------------------------
    if (event.httpMethod === "GET" && event.resource === "/appointments") {
      const date = event.queryStringParameters?.date ?? "";
      return response(200, await service.listByDate(date));
    }
    //-------------------------------------------------------
    if (event.httpMethod === "POST" && event.resource === "/customers/{customerId}/appointments") {
      const body = parseBody(event.body);
      const appointment = await service.create({
        customerId: Number(event.pathParameters?.customerId),
        vehicleId: Number(body.vehicleId),
        date: String(body.date),
        time: String(body.time),
        comments: body.comments ? String(body.comments) : null,
      });
      return response(201, appointment);
    }
    //-------------------------------------------------------
    if (event.httpMethod === "PATCH" && event.resource === "/appointments/{appointmentId}") {
      const body = parseBody(event.body);
      const appointment = await service.reschedule(
        Number(event.pathParameters?.appointmentId),
        String(body.date ?? ""),
        body.time === undefined ? undefined : String(body.time)
      );
      return response(200, appointment);

    }

    //-------------------------------------------------------
    return response(404, { message: "Not Found" });

  } catch (error) {

    // if (error instanceof ValidationError) {
    //   return response(400, { message: error.message });
    // }
    // return response(500, { message: "Internal Server Error" });

    const statusCode = statusFor(error);

    if (statusCode === 500) {
      console.error(error);
      return response(statusCode, { message: "Internal Server Error" });
    }
    return response(statusCode, { message: (error as Error).message });

  }
};