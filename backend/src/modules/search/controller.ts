import { Router, Request, Response } from 'express';
import { FlightSearchService } from './service';
import { flightRepositoryInstance } from './repository';

const searchRouter = Router();
const service = new FlightSearchService(flightRepositoryInstance);

searchRouter.get('/search', async (req: Request, res: Response) => {
    try {
        const origin = req.query.origin as string;
        const destination = req.query.destination as string;
        const apiKey = process.env.AVIATIONSTACK_KEY;

        if (apiKey) {
            const params = new URLSearchParams({
            access_key: apiKey,
            limit: '50', // Reduced for demo
            });
            if (origin){
                params.set('dep_iata', origin);
            }
            if (destination){
                params.set('arr_iata', destination);
            }
            const url = `http://api.aviationstack.com/v1/flights?${params.toString()}`;
            const response = await fetch(url);
            const json = await response.json();

            const flights = (json.data || []).map((item: any) => ({
            id: item.flight?.iata || `${item.airline?.iata || 'XX'}-${item.flight?.number || '20'}`,
            airline: item.airline?.name || item.flight?.iata || 'Unknown',
            origin: item.departure?.iata || item.departure?.icao || 'N/A',
            destination: item.arrival?.iata || item.arrival?.icao || 'N/A',
            availableSeats: 20, // Hardcoded for demo
            price: 150, // Hardcoded for demo
            }));

            return res.status(200).json(flights);
        }
       
        const flights = await service.searchFlights(origin, destination);
        res.status(200).json(flights);
    } catch (error) {
        res.status(500).json({ error: 'Помилка отримання рейсів' });
    }
});

export default searchRouter;