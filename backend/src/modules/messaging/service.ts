import { MessagingRepository, type MessageDTO } from './repository';
import { v4 as uuidv4 } from 'uuid';

export interface SendMessageDTO {
    senderId: string;
    receiverId: string;
    text: string;
}

export class MessagingService {
    constructor(private readonly repository: MessagingRepository) {}

    async sendMessage(dto: SendMessageDTO): Promise<MessageDTO> {
        const message: MessageDTO = {
            id: uuidv4(),
            senderId: dto.senderId,
            receiverId: dto.receiverId,
            text: dto.text,
            sentAt: new Date(),
            isRead: false
        };
        return await this.repository.save(message);
    }

    async getHistory(userId1: string, userId2: string): Promise<MessageDTO[]> {
        return await this.repository.findHistory(userId1, userId2);
    }
}