-- BUSINESS QUESTIONS ANSWERS
-- 1. equipment #2 (15%), #5 (12%) and #7 (8%) are below 20%. #8 is at 5% but Retired, so it doesn't count
-- 2. three equipment units (#1, #5, #7). Found in field jobs #14, #16 and #17
-- 3. Tractor = 1:1, Combine = 2:0, Sprayer = 0:2, Irrigation Pump = 0:0 (only an in-progress job)
-- 4. 101 (1 of 3 = 33%) and 102 (1 of 2 = 50%)
-- 5. 2 for supervisor 201, 1 for supervisor 204

TRUNCATE service_reports, field_jobs, equipment, field_hands, farms, users RESTART IDENTITY CASCADE;

-- in foreign key order so parents before children

INSERT INTO farms(id, name, location_region, capacity, supervisor_id) values
    (101, 'Willow Creek Farm', 'US-Central', 40, 201),
    (102, 'Red River Grain Elevator', 'US-North', 25, 201),
    (103, 'Sandhill Ranch', 'US-West', 60, 204);

INSERT INTO field_hands(id, name, farm_id) values
    (201, 'Maria Gonzalez', 101),
    (202, 'James Whitfield', 101),
    (203, 'Priya Patel', 102),
    (204, 'Tom Hendricks', 103),
    (205, 'Aisha Bello', 103);

INSERT INTO equipment(id, serial_number, model, status, fuel_level, farm_id) values
    (1, 'JD8R-1001', 'John Deere 8R 410 Tractor', 'In-Use', 72, 101),
    (2, 'CIH-2002', 'Case IH Axial-Flow 9250 Combine', 'Idle', 15, 101),
    (3, 'JDR-3003', 'John Deere R4038 Sprayer', 'Maintenance', 40, 101),
    (4, 'VAL-4004', 'Valley 8000 Irrigation Pump', 'In-Use', 88, 102),
    (5, 'JD8R-1005', 'John Deere 8R 410 Tractor', 'Maintenance', 12, 102),
    (6, 'CIH-2006', 'Case IH Axial-Flow 9250 Combine', 'In-Use', 55, 103),
    (7, 'JDR-3007', 'John Deere R4038 Sprayer', 'Idle', 8, 103),
    (8, 'VAL-4008', 'Valley 8000 Irrigation Pump', 'Retired', 5, 103);

INSERT INTO field_jobs(id, title, priority, status, equipment_id, field_hand_id) values
    (10, 'Spring Wheat Planting - North Field', 'Critical', 'Completed', 1, 201), -- 101 vs 101
    (11, 'Corn Harvest - East Section', 'Critical', 'In-Progress', 2, 202), -- 101 vs 101
    (12, 'Herbicide Spraying - Soybean Field', 'Medium', 'Failed', 3, 201), -- 101 vs 101
    (13, 'Irrigation Cycle - Pivot 3', 'Low', 'In-Progress', 4, 203), -- 102 vs 102
    (14, 'Grain Hauling to Elevator', 'Medium', 'Pending', 5, 204), -- 102 vs 103
    (15, 'Barley Harvest - West Field', 'Critical', 'Completed', 6, 205), -- 103 vs 103
    (16, 'Fungicide Application - Corn', 'Medium', 'Failed', 7, 202), -- 103 vs 101
    (17, 'Fall Tillage - South Field', 'Low', 'Failed', 1, 204), -- 101 vs 103
    (18, 'Wheat Harvest - Lot 12', 'Critical', 'Completed', 6, 205); -- 103 vs 103

INSERT INTO service_reports(id, field_job_id, file_url, notes) values
    (1, 10, '3f2b8c1e-6a4d-4e7b-9c2a-1d5e8f0a7b31-planting-summary.pdf', 'Planting finished ahead of schedule, seed rate verified.'),
    (2, 12, '8a9d4e27-0c3b-4f61-b8e5-72c1d9a6f402-sprayer-inspection.jpg', 'Clogged nozzles on boom section 3, sprayer sent to maintenance.'),
    (3, 17, 'c71e5f90-2d8a-4b36-a1f4-9e0b3c6d5a17-tillage-failure-log.txt', 'Hydraulic leak on the three-point hitch, job stopped.');

-- password is password
INSERT INTO users(id, username, hashed_pass, role) values
    (22, 'fieldhand', '$2b$12$75Mo.iaSyGFAxBEN.I6j3.0FJSK.kqei5wDhMVPRrYyVc1o6YNQa2', 'Field Hand'),
    (23, 'auditor', '$2b$12$HkQJEHPXmE9sBOyELjRGmeipGJWElIwvmpzWMLReBq8nw9YAAwSOu', 'Auditor'),
    (24, 'admin', '$2b$12$UT36.shs.klxHy7SfYkPMOQxbiE9QouUdPv1o0pIk22.akBbOYIhW', 'Farm Operations Admin');

SELECT setval(pg_get_serial_sequence('farms', 'id'), (SELECT MAX(id) FROM farms));
SELECT setval(pg_get_serial_sequence('field_hands', 'id'), (SELECT MAX(id) FROM field_hands));
SELECT setval(pg_get_serial_sequence('equipment', 'id'), (SELECT MAX(id) FROM equipment));
SELECT setval(pg_get_serial_sequence('field_jobs', 'id'), (SELECT MAX(id) FROM field_jobs));
SELECT setval(pg_get_serial_sequence('service_reports', 'id'), (SELECT MAX(id) FROM service_reports));
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
