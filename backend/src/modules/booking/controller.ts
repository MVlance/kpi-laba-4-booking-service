import { Router, Request, Response } from 'express';
import { BookingService } from './service';
import { BookingRepository } from './repository';

const bookingRouter = Router();

const repository = new BookingRepository();
const service = new BookingService(repository);

//POST /api/bookings
bookingRouter.post('/', async (req: Request, res: Response) => {
    try {
        const booking = await service.createBooking(req.body);
        res.status(201).json(booking);
    } catch (error) {
        res.status(400).json({ error: (error as Error).message });
    }
});

//DELETE /api/bookings/:id
bookingRouter.delete('/:id', async (req: Request, res: Response) => {
    try {
        const bookingId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        if (!bookingId) {
            return res.status(400).json({ error: 'Booking id is required' });
        }

        if (req.query.force === 'true') {
            await service.deleteBooking(bookingId);
            return res.status(200).json({ message: 'Booking has been deleted' });
        }
        await service.cancelBooking(bookingId);
        res.status(200).json({ message: 'Booking has been cancelled' });
    } catch (error) {
        res.status(400).json({ error: (error as Error).message || 'Error while canceling booking' });
    }
});

//GET /api/bookings?userId=...
bookingRouter.get('/', async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) {
            return res.status(400).json({ error: 'userId required' });
        }
        const bookings = await repository.findByUserId(userId);
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching bookings' });
    }
});

export default bookingRouter;