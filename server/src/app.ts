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
// Import models to ensure they are registered before use
import './models/Product.model';
import './models/Category.model';
import './models/User.model';
import './models/Review.model';
import { upload, CategoryUpload, ProfileUpload } from './utils/multer'; // Ensure you have the correct path to your multer configuration
const app = express();

app.use(express.json()); // Apply globally
app.use(express.static(path.join(__dirname, '../public')));
const ApolloServer = async () => {
  try {
    app.use(cors(corsOptions));
    await connectDB();
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

    app.post('/api/upload', upload.array('images', 5), (req, res) => {
      const files = (req.files as Express.Multer.File[]) || [];
      if (!files.length) {
        return res.status(400).json({ error: 'No files uploaded' });
      }
      const fileNames = files.map((file) => file.filename);
      res.json({ fileNames });
    });
    app.post('/api/category', CategoryUpload.single('image'), (req, res) => {
      if (req.file) {
        const { filename } = req.file;
        res.json({ filename });
      } else {
        res.status(400).json({ error: 'No file uploaded' });
      }
    });
    
    // Add route for profile image upload
    app.post('/api/profile/image', ProfileUpload.single('image'), (req, res) => {
      if (req.file) {
        const { filename } = req.file;
        res.json({ filename });
      } else {
        res.status(400).json({ error: 'No profile image uploaded' });
      }
    });
  } catch (error) {
    console.error('Error initializing the server:', error);
  }
};

ApolloServer();

// app.get('/', async (_req, res) => {
//   try {
//     const products = await ProductModel.aggregate([
//       {
//         $lookup: {
//           from: 'products', // Collection name
//           localField: 'category',
//           foreignField: 'category',
//           as: 'relatedProducts',
//         },
//       },
//       {
//         $addFields: {
//           relatedProducts: {
//             $filter: {
//               input: '$relatedProducts',
//               as: 'related',
//               cond: { $ne: ['$$related._id', '$_id'] }, // Exclude the current product
//             },
//           },
//         },
//       },
//       {
//         $addFields: {
//           relatedProducts: { $slice: ['$relatedProducts', 3] }, // Get 3 random related products
//         },
//       },
//     ]);

//     // Update each product with the new relatedProducts
//     for (const product of products) {
//       await ProductModel.updateOne(
//         { _id: product._id },
//         { $set: { relatedProducts: product.relatedProducts.map((p: any) => p._id) } } // Only store the _id of related products
//       );
//     }

//     res.json({ message: 'Products updated successfully' });
//   } catch (error) {
//     console.error('Error updating products:', error);
//     res.status(500).send('Server Error');
//   }
// });

export default app;
