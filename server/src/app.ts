import express from 'express';
import cors from 'cors';
import { corsOptions } from './utils/cors';
import dotenv from 'dotenv';
dotenv.config();
// import { RequestHandler } from 'express';
import { connectDB } from './config/db.mongodb';
import { apolloServer } from './utils/apolloServer';
import { expressMiddleware } from '@apollo/server/express4';
import path from 'path';
import { getUserFromToken } from './utils/middleware';
import { initializeAdmin } from './services/adminInit.service';
// Import models to ensure they are registered before use
import './models/Product.model';
import './models/Category.model';
import './models/User.model';
import './models/Review.model';
import uploadRoutes from './routes/upload.routes';
const app = express();

app.use(express.json()); // Apply globally
app.use(express.static(path.join(__dirname, '../public')));
const ApolloServer = async () => {
  try {
    app.use(cors(corsOptions));
    
    // Connect to database first
    await connectDB();
    console.log('✅ Database connected successfully');
    
    // Initialize admin user after database connection
    await initializeAdmin();
    
    const server = await apolloServer(); // Your function
    app.use(
      '/graphql',

      expressMiddleware(server, {
        context: async ({ req }) => {
          const result = await getUserFromToken(req.headers.authorization);
          return {
            authorize: result,
          };
        },
      }),
    );

    // Use upload routes with proper error handling
    app.use('/api', uploadRoutes);
    
  } catch (error) {
    console.error('❌ Error initializing the server:', error);
  }
};

ApolloServer();

export default app;
