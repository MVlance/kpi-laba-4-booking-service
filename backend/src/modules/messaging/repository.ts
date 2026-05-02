export interface MessageDTO {
    id: string;
    senderId: string;
    receiverId: string;
    text: string;
    sentAt: Date;
    isRead: boolean;
}

export class MessagingRepository {
    private messages: MessageDTO[] = [];

    async save(message: MessageDTO): Promise<MessageDTO> {
        this.messages.push(message);
        return message;
    }

    async findHistory(userId1: string, userId2: string): Promise<MessageDTO[]> {
        // searching for a certain chat
        return this.messages.filter(m =>
            (m.senderId === userId1 && m.receiverId === userId2) ||
            (m.senderId === userId2 && m.receiverId === userId1)
        ).sort((a, b) => a.sentAt.getTime() - b.sentAt.getTime());
    }
}