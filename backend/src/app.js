import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import patientRoutes from './routes/patients.routes.js';
import appointmentRoutes from './routes/appointments.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import { notFoundHandler, errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();

const allowedOrigins = new Set([
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
]);

const configuredFrontendUrl = process.env.FRONTEND_URL;
if (configuredFrontendUrl) {
  allowedOrigins.add(configuredFrontendUrl);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin) || /^http:\/\/localhost:\d+$/.test(origin) || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'ClinicFlow API is running',
    endpoints: {
      health: '/api/health',
      login: '/api/auth/login',
      patients: '/api/patients',
      appointments: '/api/appointments',
      dashboard: '/api/dashboard',
    },
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'ClinicFlow API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
