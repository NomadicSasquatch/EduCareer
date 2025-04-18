---------------------------------------------------
-- Insert Dummy Data
---------------------------------------------------

-- 1. UserAccount (8 rows)
INSERT INTO UserAccount (username, email, password_hash, first_name, last_name, role) VALUES
('learner1', 'learner1@example.com', 'hash1', 'Alice', 'Smith', 'learner'),
('learner2', 'learner2@example.com', 'hash2', 'Bob', 'Jones', 'learner'),
('provider1', 'provider1@example.com', 'hash3', 'Carol', 'White', 'provider'),
('admin1', 'admin1@example.com', 'hash4', 'David', 'Brown', 'admin'),
('learner3', 'learner3@example.com', 'hash5', 'Eve', 'Black', 'learner'),
('learner4', 'learner4@example.com', 'hash6', 'Frank', 'Green', 'learner'),
('provider12', 'provider12@example.com', 'hash7', 'Grace', 'Gray', 'provider'),
('learner5', 'learner5@example.com', 'hash8', 'Hank', 'Blue', 'learner');

-- 2. LearnerProfile (5 rows for learners: user_id 1,2,5,6,8)
INSERT INTO LearnerProfile (user_id, cover_image_url, profile_image_url, occupation, company_name, about_myself) VALUES
(1, 'http://example.com/cover1.jpg', 'http://example.com/profile1.jpg', 'Student', 'University A', 'Loves learning.'),
(2, 'http://example.com/cover2.jpg', 'http://example.com/profile2.jpg', 'Intern', 'Company B', 'Passionate about tech.'),
(5, 'http://example.com/cover5.jpg', 'http://example.com/profile5.jpg', 'Researcher', 'Institute C', 'Enjoys data analysis.'),
(6, 'http://example.com/cover6.jpg', 'http://example.com/profile6.jpg', 'Developer', 'Startup D', 'Building web apps.'),
(8, 'http://example.com/cover8.jpg', 'http://example.com/profile8.jpg', 'Designer', 'Agency E', 'Creative and innovative.');

-- 3. LearnerAchievement (5 rows; learner_id refers to LearnerProfile primary keys 1..5)
INSERT INTO LearnerAchievement (learner_id, achievement_type, name, issuer, date_issued, description) VALUES
(1, 'badge', 'Completion Badge', 'Org1', '2023-01-15', 'Completed the course successfully.'),
(2, 'license', 'Professional License', 'Org2', '2023-02-20', 'Licensed for advanced training.'),
(3, 'certificate', 'Excellence Certificate', 'Org3', '2023-03-10', 'Awarded for exceptional performance.'),
(4, 'badge', 'Participation Badge', 'Org4', '2023-04-05', 'Participated in the event.'),
(5, 'certificate', 'Achievement Certificate', 'Org5', '2023-05-01', 'Recognized for achievements.');

-- 4. sessions (5 rows)
INSERT INTO sessions (session_id, expires, data) VALUES
('sess1', 1700000000, 'data1'),
('sess2', 1700000100, 'data2'),
('sess3', 1700000200, 'data3'),
('sess4', 1700000300, 'data4'),
('sess5', 1700000400, 'data5');

-- 5. user_sessions (5 rows; using some user_ids and session_ids from above)
INSERT INTO user_sessions (user_id, session_id) VALUES
(1, 'sess1'),
(2, 'sess2'),
(3, 'sess3'),
(4, 'sess4'),
(5, 'sess5');

-- 6. Course (5 rows; creator_id should be a provider or admin, using user_id 3 and 4)
INSERT INTO Course (creator_id, name, description, price, max_capacity, category, source, external_reference_number, training_provider_alias, total_training_hours, total_cost, tile_image_url) VALUES
(3, 'Course 1', 'Introduction to Course 1', 100.00, 30, 'Category A', 'internal', 'REF001', 'Provider A', 10.0, 500.00, 'http://example.com/course1.jpg'),
(3, 'Course 2', 'Introduction to Course 2', 150.00, 25, 'Category B', 'internal', 'REF002', 'Provider B', 12.0, 600.00, 'http://example.com/course2.jpg'),
(4, 'Course 3', 'Introduction to Course 3', 200.00, 20, 'Category C', 'myskillsfuture', 'REF003', 'Provider C', 15.0, 750.00, 'http://example.com/course3.jpg'),
(3, 'Course 4', 'Introduction to Course 4', 120.00, 35, 'Category A', 'internal', 'REF004', 'Provider A', 8.0, 400.00, 'http://example.com/course4.jpg'),
(4, 'Course 5', 'Introduction to Course 5', 180.00, 40, 'Category D', 'myskillsfuture', 'REF005', 'Provider D', 20.0, 900.00, 'http://example.com/course5.jpg');

-- 7. OrderCourse (5 rows; using learner_ids of learners and course_ids from Course)
INSERT INTO OrderCourse (learner_id, course_id, status) VALUES
(1, 1, 'paid'),
(2, 2, 'pending'),
(5, 3, 'paid'),
(6, 4, 'pending'),
(8, 5, 'paid');

-- 8. CourseEnrollment (5 rows; using learner user_ids and course_ids)
INSERT INTO CourseEnrollment (user_id, course_id, completion_percentage, is_kicked) VALUES
(1, 1, 100.00, 0),
(2, 2, 75.50, 0),
(5, 3, 50.00, 0),
(6, 4, 0.00, 0),
(8, 5, 25.00, 0);

-- 9. CourseAttendance (5 rows; enrollment_id assumed to be 1..5)
INSERT INTO CourseAttendance (enrollment_id, date_attended, status) VALUES
(1, '2023-06-01', 'present'),
(2, '2023-06-01', 'late'),
(3, '2023-06-01', 'absent'),
(4, '2023-06-01', 'present'),
(5, '2023-06-01', 'present');

-- 10. CourseReview (5 rows)
INSERT INTO CourseReview (user_id, course_id, rating, comment) VALUES
(1, 1, 5, 'Excellent course!'),
(2, 2, 4, 'Good course, could be improved.'),
(5, 3, 3, 'Average experience.'),
(6, 4, 4, 'Very informative.'),
(8, 5, 5, 'Loved it!');

-- 11. ContactUsFeedback (5 rows; some with user_id, some null)
INSERT INTO ContactUsFeedback (user_id, name, email, subject, message) VALUES
(1, 'Alice Smith', 'learner1@example.com', 'Issue 1', 'Feedback message 1.'),
(2, 'Bob Jones', 'learner2@example.com', 'Issue 2', 'Feedback message 2.'),
(NULL, 'Anonymous', 'anon@example.com', 'Issue 3', 'Feedback message 3.'),
(5, 'Eve Black', 'learner3@example.com', 'Issue 4', 'Feedback message 4.'),
(6, 'Frank Green', 'learner4@example.com', 'Issue 5', 'Feedback message 5.');

-- 12. LectureTeam (5 rows; using course_ids from Course)
INSERT INTO LectureTeam (course_id, team_name) VALUES
(1, 'Team A'),
(2, 'Team B'),
(3, 'Team C'),
(4, 'Team D'),
(5, 'Team E');

-- 13. LectureTeamMember (5 rows; using lecture_team_id from LectureTeam and provider user_ids (3 and 7))
INSERT INTO LectureTeamMember (lecture_team_id, provider_id, role) VALUES
(1, 3, 'Lead'),
(2, 7, 'Assistant'),
(3, 3, 'Member'),
(4, 7, 'Lead'),
(5, 3, 'Assistant');

-- 14. ProviderProfile (5 rows; using provider user_ids, e.g., 3 and 7, and lecture_team_id from LectureTeam)
INSERT INTO ProviderProfile (user_id, lecture_team_id, organization_name, phone_number, address) VALUES
(3, 1, 'Provider Org A', '1234567890', 'Address A'),
(7, 2, 'Provider Org B', '0987654321', 'Address B'),
(3, 3, 'Provider Org C', '1112223333', 'Address C'),
(7, 4, 'Provider Org D', '4445556666', 'Address D'),
(3, 5, 'Provider Org E', '7778889999', 'Address E');

-- 15. CourseModule (5 rows; using course_ids from Course)
INSERT INTO CourseModule (course_id, module_name, module_description, module_order) VALUES
(1, 'Module 1', 'Introduction', 1),
(2, 'Module 2', 'Intermediate', 2),
(3, 'Module 3', 'Advanced', 3),
(4, 'Module 4', 'Expert', 4),
(5, 'Module 5', 'Finale', 5);

-- 16. ModuleProgress (5 rows; using enrollment_id from CourseEnrollment and module_id from CourseModule)
INSERT INTO ModuleProgress (enrollment_id, module_id, progress, status) VALUES
(1, 1, 100.00, 'completed'),
(2, 2, 75.00, 'in_progress'),
(3, 3, 50.00, 'in_progress'),
(4, 4, 25.00, 'not_started'),
(5, 5, 0.00, 'not_started');