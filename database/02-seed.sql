INSERT INTO customers (name, time_zone, address) VALUES
  ('Juan Perez', 'America/Mexico_City', '123 Zapote Street, Mexico City'),
  ('Maria Lopez', 'America/Monterrey', '456 Mapple Avenue, Monterrey');

INSERT INTO vehicles (customer_id, vin, license_plate, color, year, model) VALUES
  (1, '1HGCM82633A004352', 'ABC-123-A', 'Red', 2020, 'Civic'),
  (1, '2T1BURHE5JC034461', 'DEF-456-B', 'White', 2022, 'Corolla'),
  (2, '3VWFE21C04M000001', 'GHI-789-C', 'Blue', 2019, 'Jetta');

INSERT INTO appointments (customer_id, vehicle_id, appointment_date, appointment_time, comments, status) VALUES
  (1, 1, '2026-12-01', '10:00', 'Oil change', 'ENABLED'),
  (2, 3, '2026-12-01', '12:00', 'Brake inspection', 'ENABLED'),
  (1, 2, '2026-12-02', '09:00', 'Cancelled by customer', 'DISABLED');