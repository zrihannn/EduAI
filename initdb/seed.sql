-- Seed Data for eduai_db

-- Users
-- Password for all is "password" (bcrypt hash of "password" with strength 10)
INSERT INTO users (id, full_name, email, password_hash, role, is_verified, is_active) VALUES
('b2a472c1-274e-4e67-a2f0-58c70428d087', 'Admin User', 'admin@eduai.com', '$2a$10$wY9/F6YkF8c3m7m2Q47Fv.P4b4H6H/H0b8s6/y8n1zY.LqN2F6DRe', 'ADMIN', true, true),
('f1a23456-7890-abcd-ef01-234567890123', 'John Doe (Student)', 'student@eduai.com', '$2a$10$wY9/F6YkF8c3m7m2Q47Fv.P4b4H6H/H0b8s6/y8n1zY.LqN2F6DRe', 'STUDENT', true, true);

-- Platform Configs
INSERT INTO platform_configs (id, platform, base_url, is_active, topics, logo_url) VALUES
('a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d', 'YOUTUBE', 'https://youtube.com', true, '["all"]', 'https://upload.wikimedia.org/wikipedia/commons/e/ef/Youtube_logo_2015.png'),
('b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e', 'COURSERA', 'https://coursera.org', true, '["cs", "math", "business"]', 'https://upload.wikimedia.org/wikipedia/commons/9/97/Coursera-Logo_600x600.svg'),
('c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f', 'UDEMY', 'https://udemy.com', true, '["programming", "design", "marketing"]', 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Udemy_logo.svg');

-- Topics
INSERT INTO topics (id, name, slug, category, description) VALUES
('d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Machine Learning', 'machine-learning', 'Computer Science', 'Foundations of ML and AI'),
('e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Calculus', 'calculus', 'Mathematics', 'Derivatives and Integrals'),
('f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'React.js', 'react-js', 'Web Development', 'Frontend framework by Meta');

-- Mock Course Recommendations for fallback testing
INSERT INTO course_recommendations (id, topic_id, title, description, url, thumbnail_url, platform, course_type, instructor, duration, rating, tags, relevance_score, is_active) VALUES
('11111111-2222-3333-4444-555555555555', 'd4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f9a', 'Machine Learning for Everybody', 'A complete python tutorial for beginners', 'https://youtube.com/watch?v=i_LwzRmA_08', 'https://img.youtube.com/vi/i_LwzRmA_08/maxresdefault.jpg', 'YOUTUBE', 'FREE', 'freeCodeCamp', '3 Hours', 4.8, '["python", "ai", "ml"]', 0.95, true),
('22222222-3333-4444-5555-666666666666', 'e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f9a0b', 'Calculus 1 - Full College Course', 'Limits, Continuity, Derivatives', 'https://youtube.com/watch?v=WsQQvHm4lSw', 'https://img.youtube.com/vi/WsQQvHm4lSw/maxresdefault.jpg', 'YOUTUBE', 'FREE', 'freeCodeCamp', '12 Hours', 4.9, '["math", "calculus"]', 0.88, true),
('33333333-4444-5555-6666-777777777777', 'f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f9a0b1c', 'React - The Complete Guide', 'Master React.js with hooks and next.js', 'https://www.udemy.com/course/react-the-complete-guide-incl-redux/', 'https://img-c.udemycdn.com/course/480x270/1362070_b9a1_2.jpg', 'UDEMY', 'PAID', 'Maximilian Schwarzmüller', '40 Hours', 4.7, '["react", "node", "web"]', 0.92, true);

-- Add some pre-saved courses for the student
INSERT INTO saved_courses (id, user_id, recommendation_id) VALUES
('44444444-5555-6666-7777-888888888888', 'f1a23456-7890-abcd-ef01-234567890123', '11111111-2222-3333-4444-555555555555');

-- Add dummy feedback
INSERT INTO feedbacks (id, user_id, sender_name, sender_email, subject, message, category, status, is_email_sent) VALUES
('55555555-6666-7777-8888-999999999999', 'f1a23456-7890-abcd-ef01-234567890123', 'John Doe', 'student@eduai.com', 'Great UI', 'Really enjoying the platform!', 'GENERAL', 'OPEN', true);
