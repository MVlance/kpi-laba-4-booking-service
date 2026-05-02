import express, { Request, Response } from 'express';
import cors from 'cors';
import bookingRouter from './modules/booking/controller';
import { setupMessagingGateway } from './modules/messaging/gateway';
import searchRouter from './modules/search/controller';
import { createServer } from 'http';
import { Server } from 'socket.io';


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

//base endpoint for checking
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'API is running', timestamp: new Date() });
});

//loading the chat
setupMessagingGateway(io);

httpServer.listen(PORT, () => {
    console.log(`API Gateway and WS successfully loaded on http://localhost:${PORT}`);
});