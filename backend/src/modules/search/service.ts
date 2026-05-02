import { FlightRepository, type FlightDTO } from './repository';

export class FlightSearchService {
    constructor(private flightRepo: FlightRepository) {}

    async searchFlights(origin?: string, destination?: string): Promise<FlightDTO[]> {
        let flights = await this.flightRepo.findAll();

        if (origin) {
            flights = flights.filter(f => f.origin.toLowerCase() === origin.toLowerCase());
        }
        if (destination) {
            flights = flights.filter(f => f.destination.toLowerCase() === destination.toLowerCase());
        }

        return flights;
    }
}