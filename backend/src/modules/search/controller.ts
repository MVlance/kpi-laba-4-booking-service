import { Router, Request, Response } from 'express';
import { FlightSearchService } from './service';
import { flightRepositoryInstance } from './repository';

const searchRouter = Router();
const service = new FlightSearchService(flightRepositoryInstance);

searchRouter.get('/search', async (req: Request, res: Response) => {
    try {
        const origin = req.query.origin as string;
        const destination = req.query.destination as string;

        const flights = await service.searchFlights(origin, destination);
        res.status(200).json(flights);
    } catch (error) {
        res.status(500).json({ error: 'Помилка отримання рейсів' });
    }
});

export default searchRouter;