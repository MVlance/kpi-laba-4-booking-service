import { AuthRepository } from './repository';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

export class AuthService {
    constructor(private readonly authRepo: AuthRepository) {}

    async login(username: string, password: string) {
        const user = await this.authRepo.findByUsername(username);

        if (!user || user?.password !== password) {
            throw new Error('Невірний логін або пароль');
        }

        // Generate real JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT secret is not configured');
        }

        const token = jwt.sign(
            { userId: user.username },
            secret,
            { expiresIn: '24h' }
        );

        return {
            userId: user.username,
            role: user.role,
            token
        };
    }
}
