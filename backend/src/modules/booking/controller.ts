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
        // @ts-ignore
        await service.cancelBooking(req.params.id);
        res.status(200).json({ message: 'Booking has been cancelled' });
    } catch (error) {
        res.status(400).json({ error: 'Error while canceling booking' });
    }
});

export default bookingRouter;