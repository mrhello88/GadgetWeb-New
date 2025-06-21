import cors from 'cors';

const allowedOrigins: string[] = [
  'http://localhost:5173',
  'http://localhost:5174', 
  'http://localhost:5175',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  'http://127.0.0.1:5175',
  process.env.CORS_ORIGIN || '',
];

export const corsOptions: cors.CorsOptions = {
  origin: allowedOrigins,
  methods: [process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE'],
  credentials: process.env.CORS_CREDENTIALS === 'true',
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Apollo-Require-Preflight', // Required for apollo-upload-client
    'Accept',
    'Origin',
    'X-Requested-With',
  ],
};
