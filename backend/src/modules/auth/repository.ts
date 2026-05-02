export interface User {
    id: string;
    username: string;
    password: string; //in real project, it would be hash (bcrypt)
    role: 'TOURIST' | 'AGENT';
}

export class AuthRepository {
    private users: User[] = [
        { id: 'u1', username: 'Tourist1', password: 'password123', role: 'TOURIST' },
        { id: 'u2', username: 'Agent1', password: 'password123', role: 'AGENT' }
    ];

    async findByUsername(username: string): Promise<User | undefined> {
        return this.users.find(u => u.username === username);
    }
}