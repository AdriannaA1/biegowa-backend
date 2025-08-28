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

app.get('/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`;
  res.json({ ok: true });
});

app.get('/', (_req, res) => {
  res.json({ message: 'Backend działa 🚀', health: '/health' });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`API listening on :${port}`));
