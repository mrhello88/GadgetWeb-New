import cors from 'cors';

const allowedOrigins: string[] = [
  process.env.CORS_ORIGIN || '',
  'http://127.0.0.1:5173', // just in case
];

export const corsOptions: cors.CorsOptions = {
  origin: 'http://localhost:5173', // Ensure lowercase "origin"
  methods: [process.env.CORS_METHODS || 'GET,HEAD,PUT,PATCH,POST,DELETE'],
  credentials: process.env.CORS_CREDENTIALS === 'true', // Ensure lowercase "credentials"
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Apollo-Require-Preflight', // Required for apollo-upload-client
    'Accept',
    'Origin',
    'X-Requested-With',
  ],
};
