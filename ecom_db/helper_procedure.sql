USE ecom_db;

-- DELIMITER $$
-- CREATE PROCEDURE CreateDatabase(IN Database_name VARCHAR(64))
-- BEGIN
--     SET @SQL = CONCAT('CREATE DATABASE ', QUOTE_IDENTIFIER(Database_name));
--     PREPARE stmt FROM @SQL;
--     EXECUTE stmt;
--     DEALLOCATE PREPARE stmt;
-- END$$
-- DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS getAllUser$$
CREATE PROCEDURE getAllUser()
BEGIN
    SELECT * FROM useraccount;
END$$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS getUserById$$
CREATE PROCEDURE getUserById(in userID INT)
BEGIN
    SELECT * FROM useraccount WHERE user_ID = userID;
END$$
DELIMITER ;

-- Authentication SQL
DELIMITER $$
DROP PROCEDURE IF EXISTS loginUser$$
CREATE PROCEDURE loginUser(IN username VARCHAR(255), IN password VARCHAR(255))
BEGIN
  SELECT * FROM useraccount AS UA WHERE (UA.username = username OR UA.email = username) AND UA.password_hash = password;
END $$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS registerUser$$
CREATE PROCEDURE registerUser(IN username VARCHAR(255), IN password VARCHAR(255), IN email VARCHAR(255))
BEGIN
  INSERT INTO useraccount (username, password, email) VALUES (username, password, email);
END $$
DELIMITER ;

DELIMITER $$
DROP PROCEDURE IF EXISTS insertUserSessionHistory$$
CREATE PROCEDURE insertUserSessionHistory(IN user_id INT, IN session_id VARCHAR(255))
BEGIN
  INSERT INTO user_sessions (user_id, session_id) VALUES (user_id, session_id);
END $$
DELIMITER ;

