-- Create admin user with password: admin123
UPDATE users
SET password_hash = '$2b$12$HoVoXoVdlh7HfS37g/34xekRt7fMFehU5Z7dxCKHU1qOW5Bw.RVRG'
WHERE email = 'admin@complianceiq.com';

SELECT email, password_hash FROM users WHERE email = 'admin@complianceiq.com';
