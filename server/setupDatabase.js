// scripts/setupDatabase.js
const mysql = require('mysql2/promise');
require('dotenv').config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tutoring_platform',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Function to execute queries
const executeQuery = async (query, params = []) => {
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query(query, params);
    return rows;
  } finally {
    if (connection) connection.release();
  }
};

// Function to generate IDs (fallback if MySQL function fails)
const generateId = async () => {
  try {
    const [result] = await executeQuery('SELECT generate_pocketbase_id() as id');
    return result.id;
  } catch (error) {
    // Fallback to JavaScript implementation if MySQL function doesn't exist
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 15; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
};

const setupDatabase = async () => {
  let connection;
  
  try {
    console.log('🔧 Setting up database...');
    
    // Connect to MySQL server (without database first)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      port: process.env.DB_PORT || 3306
    });
    
    console.log('✅ Connected to MySQL server');
    
    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'tutoring_platform';
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbName}`);
    console.log(`✅ Database '${dbName}' created or already exists`);
    
    // Close connection and reconnect with database selected
    await connection.end();
    
    // Reconnect with the specific database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'tutoring_platform',
      port: process.env.DB_PORT || 3306
    });
    
    console.log(`✅ Connected to database '${dbName}'`);
    
    // Create tables
    console.log('📋 Creating tables...');
    
    // Student Premium Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS findtitor_premium_student (
        id VARCHAR(15) PRIMARY KEY,
        subject TEXT,
        email TEXT,
        mobile TEXT,
        topix TEXT,
        descripton TEXT,
        ispayed BOOLEAN DEFAULT FALSE,
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        paymentDate TIMESTAMP NULL,
        stripeSessionId VARCHAR(255) NULL,
        paymentAmount DECIMAL(10,2) NULL,
        INDEX idx_student_email (email(255)),
        INDEX idx_student_payment (ispayed, created)
      )
    `);
    console.log('✅ Table findtitor_premium_student created');
    
    // Teacher Premium Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS findtutor_premium_teachers (
        id VARCHAR(15) PRIMARY KEY,
        link_or_video BOOLEAN DEFAULT TRUE,
        link1 TEXT,
        link2 TEXT,
        link3 TEXT,
        video1 VARCHAR(255),
        video2 VARCHAR(255),
        video3 VARCHAR(255),
        ispaid BOOLEAN DEFAULT FALSE,
        mail VARCHAR(255),
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        paymentDate TIMESTAMP NULL,
        stripeSessionId VARCHAR(255) NULL,
        paymentAmount DECIMAL(10,2) NULL,
        INDEX idx_teacher_email (mail),
        INDEX idx_teacher_payment (ispaid, created)
      )
    `);
    console.log('✅ Table findtutor_premium_teachers created');
    
    // Subscriptions Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS findtutor_subcriptions (
        id VARCHAR(15) PRIMARY KEY,
        field VARCHAR(255),
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_subscription_email (field)
      )
    `);
    console.log('✅ Table findtutor_subcriptions created');
    
    // Create the ID generation function
    try {
      await connection.query(`
        DELIMITER //
        CREATE FUNCTION IF NOT EXISTS generate_pocketbase_id() 
        RETURNS VARCHAR(15)
        READS SQL DATA
        DETERMINISTIC
        BEGIN
            DECLARE chars VARCHAR(36) DEFAULT 'abcdefghijklmnopqrstuvwxyz0123456789';
            DECLARE result VARCHAR(15) DEFAULT '';
            DECLARE i INT DEFAULT 0;
            
            WHILE i < 15 DO
                SET result = CONCAT(result, SUBSTRING(chars, FLOOR(1 + RAND() * 36), 1));
                SET i = i + 1;
            END WHILE;
            
            RETURN result;
        END //
        DELIMITER ;
      `);
      console.log('✅ Function generate_pocketbase_id created');
    } catch (funcError) {
      console.log('⚠️ Function creation skipped (may already exist or insufficient privileges)');
      console.error('Function error details:', funcError);
    }
    
    // Insert some sample data for testing (optional)
    if (process.argv.includes('--sample-data')) {
      console.log('📝 Inserting sample data...');
      
      // Generate IDs first
      const studentId = await generateId();
      const teacherId = await generateId();
      const subId = await generateId();
      
      // Sample student premium record
      await connection.query(`
        INSERT IGNORE INTO findtitor_premium_student 
        (id, subject, email, mobile, topix, descripton, ispayed)
        VALUES 
        (?, 'Mathematics', 'student@example.com', '+1234567890', 'Algebra, Calculus', 'Need help with advanced math topics', true)`,
        [studentId]
      );
      
      // Sample teacher premium record
      await connection.query(`
        INSERT IGNORE INTO findtutor_premium_teachers 
        (id, link_or_video, link1, link2, link3, ispaid, mail)
        VALUES 
        (?, true, 'https://youtube.com/watch?v=example1', 'https://youtube.com/watch?v=example2', '', true, 'teacher@example.com')`,
        [teacherId]
      );
      
      // Sample subscription
      await connection.query(`
        INSERT IGNORE INTO findtutor_subcriptions 
        (id, field)
        VALUES 
        (?, 'subscriber@example.com')`,
        [subId]
      );
      
      console.log('✅ Sample data inserted');
    }
    
    console.log('🎉 Database setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Error setting up database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};

module.exports = {
  executeQuery,
  generateId,
  setupDatabase
};