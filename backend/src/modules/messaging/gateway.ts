import { Server, Socket } from 'socket.io';
import { MessagingService } from './service';
import { MessagingRepository } from './repository';

const repository = new MessagingRepository();
const service = new MessagingService(repository);

export const setupMessagingGateway = (io: Server) => {
    // userId -> socketId
    const activeSockets = new Map<string, string>();

    io.on('connection', (socket: Socket) => {
        console.log(`🔌 Нове WebSocket з'єднання: ${socket.id}`);

        // 1. user enters and generated his socket
        socket.on('register', (userId: string) => {
            activeSockets.set(userId, socket.id);
            console.log(`👤 Користувач ${userId} в онлайні`);
        });

        // 2. message sending process
        socket.on('sendMessage', async (data: { senderId: string, receiverId: string, text: string }) => {
            try {
                //saving the message
                const message = await service.sendMessage(data);

                //if user is online, momentarily pushing the message to them
                const receiverSocketId = activeSockets.get(data.receiverId);
                if (receiverSocketId) {
                    io.to(receiverSocketId).emit('newMessage', message);
                }

                socket.emit('messageSent', message);
            } catch (error) {
                console.error('Message sending error', error);
            }
        });

        // 3. obtaining chat history
        socket.on('getHistory', async (data: { userId1: string, userId2: string }) => {
            const history = await service.getHistory(data.userId1, data.userId2);
            socket.emit('history', history);
        });

        // 4. closing the tab
        socket.on('disconnect', () => {
            for (const [userId, socketId] of activeSockets.entries()) {
                if (socketId === socket.id) {
                    activeSockets.delete(userId);
                    console.log(`User ${userId} has left`);
                    break;
                }
            }
        });
    });
};