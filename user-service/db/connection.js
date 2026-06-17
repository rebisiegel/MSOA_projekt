import mysql from 'mysql2/promise.js';

const pool = mysql.createPool({
  host: process.env.DB_HOST, 
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, 
  port: parseInt(process.env.DB_PORT, 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});


export async function waitForDatabase() {
  let attempts = 10; 
  const delay = 3000; 

  while (attempts > 0) {
    try {
    
      const connection = await pool.getConnection();
      await connection.ping(); 
      connection.release(); 
      
      console.log('Successfully connected to the database!');
      return; 
    } catch (err) {
      attempts--;
      console.log(`Database is not ready yet. Retrying in ${delay / 1000}s... (Attempts left: ${attempts})`);
      if (attempts === 0) {
        throw new Error('Could not connect to the database after multiple attempts.');
      }
    
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

export default pool;
