import { AuthRepository } from './repository';
import { v4 as uuidv4 } from 'uuid';

export class AuthService {
    constructor(private readonly authRepo: AuthRepository) {}

    async login(username: string, password: string) {
        const user = await this.authRepo.findByUsername(username);

        if (!user || user?.password !== password) {
            throw new Error('Невірний логін або пароль');
        }

        //generating fake jwt token for MVP
        const mockToken = `jwt-token-${uuidv4()}`;

        return {
            userId: user.username,
            role: user.role,
            token: mockToken
        };
    }
}
