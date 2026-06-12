const { Pool } = require("pg");
const { parse } = require("pg-connection-string");
require("dotenv").config({ path: ".env.local" });

async function testConnection() {
  console.log("Using DATABASE_URL:", process.env.DATABASE_URL);
  
  const connectionString = process.env.DATABASE_URL;
  const config = parse(connectionString);
  config.ssl = {
    rejectUnauthorized: false
  };

  const pool = new Pool(config);

  try {
    const client = await pool.connect();
    console.log("Successfully connected to the database!");
    const res = await client.query("SELECT NOW()");
    console.log("Query result:", res.rows[0]);
    client.release();
  } catch (err) {
    console.error("Database connection failed:", err);
  } finally {
    await pool.end();
  }
}

testConnection();
