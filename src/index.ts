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

// prosty health-check
app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
});

// test: tworzenie usera
app.post('/users', async (req, res) => {
  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'email & password required' });
  const user = await prisma.user.create({ data: { email, password } });
  res.status(201).json({ id: user.id, email: user.email });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on :${port}`));
