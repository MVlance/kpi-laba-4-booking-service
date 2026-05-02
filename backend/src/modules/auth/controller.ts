import { Router, Request, Response } from 'express';
import { AuthService } from './service';
import { AuthRepository } from './repository';

const authRouter = Router();
const service = new AuthService(new AuthRepository());

//POST /api/auth/login
authRouter.post('/login', async (req: Request, res: Response) => {
    try {
        const { username, password } = req.body;
        const result = await service.login(username, password);
        res.status(200).json(result);
    } catch (error) {
        res.status(401).json({ error: (error as Error).message });
    }
});

export default authRouter;