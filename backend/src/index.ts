import express, { Request, Response } from 'express';
import cors from 'cors';
import bookingRouter from './modules/booking/controller';
import { setupMessagingGateway } from './modules/messaging/gateway';
import authRouter from './modules/auth/controller';
import searchRouter from './modules/search/controller';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

declare module 'express' {
  interface Request {
    userId?: string;
  }
}

const authMiddleware = (req: Request, res: Response, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return res.status(500).json({ error: 'JWT secret is not configured' });
  }

  try {
    const payload = jwt.verify(token, secret) as unknown;
    const data = payload as { userId: string };
    if (!data?.userId) {
      return res.status(401).json({ error: 'Invalid token payload' });
    }
    req.userId = data.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};


const app = express();
const PORT = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Middleware
app.use(cors());
app.use(express.json()); //parsing JSON body

//routing (local API Gateway)
app.use('/api/bookings', bookingRouter);
app.use('/api/flights', searchRouter);
app.use('/api/auth', authRouter);

//base endpoint for checking
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'API is running', timestamp: new Date() });
});

//loading the chat
setupMessagingGateway(io);

httpServer.listen(PORT, () => {
    console.log(`API Gateway and WS successfully loaded on http://localhost:${PORT}`);
});