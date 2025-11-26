import express from 'express';
import './config/dynamodb.js'; // Initialize DynamoDB connection
import authRoutes from './routes/authRoutes.js';
import cognitoAuthRoutes from './routes/cognitoAuthRoutes.js';
import campaignRoutes from './routes/campaignRoutes.js';
import dotenv from 'dotenv';
import callRoutes from './routes/callRoutes.js';
import twilioRoutes from './twilio/twilioRoutes.js';
import cors from 'cors';

dotenv.config();
const app = express();

console.log('✅ DynamoDB Connected');

//cors
// Enable CORS for all origins (dev only)
app.use(cors());

// For stricter control (optional)
// app.use(cors({
//   origin: 'http://localhost:5173',
//   methods: ['GET', 'POST', 'PUT', 'DELETE'],
//   credentials: true, // only if using cookies/auth
// }));


const allowedOrigins = ['http://localhost:5173', 'https://callingagent.aaditya78.live', 'https://32b5c7de7f9b.ngrok-free.app'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true); // Allow the request
    } else {
      callback(new Error('Not allowed by CORS')); // Reject the request
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true, // only if using cookies/auth
}));


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/audio', express.static('public'));
app.use('/api', authRoutes);
app.use('/api', cognitoAuthRoutes);
app.use('/api', campaignRoutes);

app.get('/health', (req, res) => {
  
  res.status(200).json({ status: 'OK' });
});

app.use('/api/call', callRoutes);
app.use('/twilio', twilioRoutes);

app.get('/', (req, res) => {
  
  res.send('Welcome to the AI Voice Call Service');
});
app.listen(8080, () => {
  console.log('Server running on http://localhost:8080');
});