-- BUSINESS QUESTIONS ANSWERS
-- 1. Equipment #2 #3 are below 20%
-- 2. Only one equipment unit (#1).  Found in field job ID #10
-- 3. MODEL X = 0:1 ratio MODEL XI = 1/1
-- 4. Only 102
-- 5. Only 1 for 101, None for 102

-- Wipe existing rows so the seed can be re-run safely.
TRUNCATE service_reports, field_jobs, equipment, field_hands, farms, users RESTART IDENTITY CASCADE;

-- Inserted in foreign key order: parents before children.

INSERT INTO farms(id, name, location_region, capacity, supervisor_id) values
    (101, 'Merry Farm', 'US-East', 40, 201),
    (102, 'Apple Farm', 'US-Central', 90, 202);

INSERT INTO field_hands(id, name, farm_id) values
    (201, 'Hand A', 101),
    (202, 'Hand B', 102),
    (203, 'Hand C', 102);

INSERT INTO equipment(id, serial_number, model, status, fuel_level, farm_id) values
    (1, 'FRM-1001' , 'MODEL X', 'Idle', 30, 102),
    (2, 'FRM-1002', 'MODEL X', 'Idle', 10, 102),
    (3, 'FRM-1003', 'MODEL XI', 'Maintenance', 9, 102),
    (4, 'FRM-1004', 'MODEL XI', 'In-Use', 60, 101);

INSERT INTO field_jobs(id, title, priority, status, equipment_id, field_hand_id) values
    (10, 'Harvest Season', 'Low', 'In-Progress', 1, 201), -- 102 vs 101
    (11, 'Watering Ground', 'Critical', 'Completed', 4, 201), -- 101 vs 101
    (12, 'Plowing Ground', 'Low', 'Failed', 2, 203), -- 102 vs 102
    (13, 'Seeding Fields', 'Low', 'Failed', 3, 203); -- 102 vs 102

INSERT INTO service_reports(id, field_job_id, file_url, notes) values
    (1, 10, 'test.com', 'No notes'),
    (2, 11, 'test.com', 'No notes p.2');

-- password is password
INSERT INTO users(id, username, hashed_pass, role) values
    (22, 'fieldhand', '$2b$12$75Mo.iaSyGFAxBEN.I6j3.0FJSK.kqei5wDhMVPRrYyVc1o6YNQa2', 'Field Hand'),
    (23, 'auditor', '$2b$12$HkQJEHPXmE9sBOyELjRGmeipGJWElIwvmpzWMLReBq8nw9YAAwSOu', 'Auditor'),
    (24, 'admin', '$2b$12$UT36.shs.klxHy7SfYkPMOQxbiE9QouUdPv1o0pIk22.akBbOYIhW', 'Farm Operations Admin');

-- Explicit ids don't advance the serial sequences, so move them past the seeded rows
-- (otherwise the next row created through the API collides with an existing id).
SELECT setval(pg_get_serial_sequence('farms', 'id'), (SELECT MAX(id) FROM farms));
SELECT setval(pg_get_serial_sequence('field_hands', 'id'), (SELECT MAX(id) FROM field_hands));
SELECT setval(pg_get_serial_sequence('equipment', 'id'), (SELECT MAX(id) FROM equipment));
SELECT setval(pg_get_serial_sequence('field_jobs', 'id'), (SELECT MAX(id) FROM field_jobs));
SELECT setval(pg_get_serial_sequence('service_reports', 'id'), (SELECT MAX(id) FROM service_reports));
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
