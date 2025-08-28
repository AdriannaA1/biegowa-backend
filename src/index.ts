import { Client as PgClient } from 'pg';
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { PrismaClient } from '@prisma/client';

const app = express();

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DIRECT_URL! } }
});

app.use(express.json(), cors(), helmet(), morgan('dev'));

// 1) podejrzyjmy, co Render widzi w ENV (zamaskujemy hasło)
app.get('/debug-env', (_req, res) => {
  const mask = (s?: string) => s ? s.replace(/:(.*?)@/, ':****@') : s;
  res.json({
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: mask(process.env.DATABASE_URL),
    DIRECT_URL: mask(process.env.DIRECT_URL)
  });
});

// 2) niezależny test połączenia przez 'pg' (omija Prismę)
app.get('/debug-db', async (_req, res) => {
  try {
    const url = process.env.DIRECT_URL!;
    const client = new PgClient({
      connectionString: url,
      ssl: { rejectUnauthorized: true }
    });
    await client.connect();
    const r = await client.query('SELECT version(), current_database(), current_user;');
    await client.end();
    res.json({ ok: true, info: r.rows[0] });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || String(e) });
  }
});


app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Backend działa 🚀', health: '/health' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on :${port}`));
