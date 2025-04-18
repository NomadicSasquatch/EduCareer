DROP SCHEMA IF EXISTS ecom_db;
CREATE DATABASE IF NOT EXISTS ecom_db;
USE ecom_db;

DROP TABLE IF EXISTS ModuleProgress;
DROP TABLE IF EXISTS CourseModule;
DROP TABLE IF EXISTS ProviderProfile;
DROP TABLE IF EXISTS ContactUsFeedback;
DROP TABLE IF EXISTS CourseReview;
DROP TABLE IF EXISTS CourseAttendance;
DROP TABLE IF EXISTS CourseEnrollment;
DROP TABLE IF EXISTS Course;
DROP TABLE IF EXISTS user_sessions;
DROP TABLE IF EXISTS sessions;
DROP TABLE IF EXISTS LearnerAchievement;
DROP TABLE IF EXISTS LearnerProfile;
DROP TABLE IF EXISTS UserAccount;

CREATE TABLE IF NOT EXISTS UserAccount (
    user_id INT AUTO_INCREMENT PRIMARY KEY,  
    username VARCHAR(50) NOT NULL UNIQUE,    
    email VARCHAR(100) NOT NULL UNIQUE,      
    password_hash VARCHAR(255) NOT NULL,     
    first_name VARCHAR(50),                  
    last_name VARCHAR(50),
    phone_number VARCHAR(15) NULL, 
    role ENUM('provider','learner','admin') DEFAULT 'learner',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS LearnerProfile (
    learner_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    cover_image_url VARCHAR(255),
    profile_image_url VARCHAR(255),
    occupation VARCHAR(100),
    company_name VARCHAR(255),
    about_myself TEXT,                
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserAccount(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS LearnerAchievement (
    achievement_id INT AUTO_INCREMENT PRIMARY KEY,
    learner_id INT NOT NULL,
    achievement_type ENUM('badge','license','certificate') NOT NULL,
    name VARCHAR(255) NOT NULL,   
    issuer VARCHAR(255),          
    date_issued DATE,             
    description TEXT,             
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (learner_id) REFERENCES LearnerProfile(learner_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS sessions (
    session_id VARCHAR(255) NOT NULL PRIMARY KEY,
    expires BIGINT NOT NULL,
    data TEXT
);

CREATE TABLE IF NOT EXISTS user_sessions (
    user_id INT NOT NULL,
    session_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, session_id),
    FOREIGN KEY (user_id) REFERENCES UserAccount(user_id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES sessions(session_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS Course (
    course_id INT AUTO_INCREMENT PRIMARY KEY,
    creator_id INT NOT NULL, 
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    max_capacity INT DEFAULT 0,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    source ENUM('internal','myskillsfuture') DEFAULT 'internal',
    external_reference_number VARCHAR(100),
    training_provider_alias VARCHAR(255),
    total_training_hours DECIMAL(5,1),
    total_cost DECIMAL(10,2),
    tile_image_url VARCHAR(255),
    FOREIGN KEY (creator_id) REFERENCES UserAccount(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CourseEnrollment (
    enrollment_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    completion_percentage DECIMAL(5,2) DEFAULT 0.00,
    is_kicked BOOLEAN DEFAULT 0,
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserAccount(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CourseAttendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    date_attended DATE NOT NULL,
    status ENUM('present','absent','late') DEFAULT 'present',
    FOREIGN KEY (enrollment_id) REFERENCES CourseEnrollment(enrollment_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CourseReview (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    course_id INT NULL,
    externalReferenceNumber VARCHAR(255) NULL,
    rating TINYINT NOT NULL,
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserAccount(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ContactUsFeedback (
    feedback_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserAccount(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ProviderProfile (
    provider_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    organization_name VARCHAR(255), 
    phone_number VARCHAR(15),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES UserAccount(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS CourseModule (
    module_id INT AUTO_INCREMENT PRIMARY KEY,
    course_id INT NOT NULL,
    module_name VARCHAR(255) NOT NULL,
    module_description TEXT,
    module_order INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES Course(course_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ModuleProgress (
    progress_id INT AUTO_INCREMENT PRIMARY KEY,
    enrollment_id INT NOT NULL,
    module_id INT NOT NULL,
    progress DECIMAL(5,2) DEFAULT 0.0,
    status ENUM('not_started','in_progress','completed') DEFAULT 'not_started',
    last_access TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (enrollment_id) REFERENCES CourseEnrollment(enrollment_id) ON DELETE CASCADE,
    FOREIGN KEY (module_id) REFERENCES CourseModule(module_id) ON DELETE CASCADE
);
