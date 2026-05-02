import { FlightSearchService } from './service';
import { FlightRepository } from './repository';

describe('FlightSearchService', () => {
    let service: FlightSearchService;
    let repository: FlightRepository;

    beforeEach(() => {
        repository = new FlightRepository();
        service = new FlightSearchService(repository);
    });

    it('повинен повертати всі рейси, якщо параметри не передані', async () => {
        const flights = await service.searchFlights();
        expect(flights.length).toBeGreaterThan(0);
    });

    it('повинен фільтрувати рейси за пунктом відправлення (origin)', async () => {
        const flights = await service.searchFlights('KBP');
        // Перевіряємо, що у всіх знайдених рейсів origin === 'KBP'
        flights.forEach(flight => {
            expect(flight.origin).toBe('KBP');
        });
    });

    it('повинен повертати пустий масив, якщо рейсів за маршрутом немає', async () => {
        const flights = await service.searchFlights('Mars', 'Jupiter');
        expect(flights.length).toBe(0);
    });
});