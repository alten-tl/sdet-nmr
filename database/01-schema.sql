CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  time_zone VARCHAR(50) NOT NULL,
  address VARCHAR(255) NOT NULL
);

CREATE TABLE vehicles (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers (id),
  vin VARCHAR(17) NOT NULL UNIQUE,
  license_plate VARCHAR(15) NOT NULL,
  color VARCHAR(30) NOT NULL,
  year INTEGER NOT NULL,
  model VARCHAR(50) NOT NULL
);

CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER NOT NULL REFERENCES customers (id),
  vehicle_id INTEGER NOT NULL REFERENCES vehicles (id),
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  comments TEXT,
  status VARCHAR(10) NOT NULL DEFAULT 'ENABLED' CHECK (status IN ('ENABLED', 'DISABLED')),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX appointments_enabled_slot
  ON appointments (appointment_date, appointment_time)
  WHERE status = 'ENABLED';