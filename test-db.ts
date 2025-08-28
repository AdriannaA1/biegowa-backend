import 'dotenv/config';
import { Client } from 'pg';

(async () => {
  try {
    const url = process.env.DIRECT_URL!; // testujemy direct (bez pgbouncera)
    const client = new Client({ connectionString: url, ssl: { rejectUnauthorized: true } });
    await client.connect();
    const r = await client.query('SELECT version(), current_database(), current_user;');
    console.log('OK:', r.rows[0]);
    await client.end();
  } catch (e) {
    console.error('DB ERROR:', e);
    process.exit(1);
  }
})();
