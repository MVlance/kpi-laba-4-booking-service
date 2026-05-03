export interface FlightDTO {
    id: string;
    airline: string;
    origin: string;
    destination: string;
    availableSeats: number;
    price: number;
}

export class FlightRepository {
    //hardcoded for prototype
    private readonly flights: FlightDTO[] = [
        { id: 'f1', airline: 'Ryanair', origin: 'KBP', destination: 'LHR', availableSeats: 42, price: 150 },
        { id: 'f2', airline: 'Wizz Air', origin: 'KBP', destination: 'WAW', availableSeats: 12, price: 80},
        { id: 'f3', airline: 'Lufthansa', origin: 'FRA', destination: 'KBP', availableSeats: 0, price: 200 }, // 0 seats
        { id: 'f4', airline: 'Turkish Airlines', origin: 'KBP', destination: 'IST', availableSeats: 5, price: 250 },
        { id: 'f5', airline: 'British Airways', origin: 'LHR', destination: 'JFK', availableSeats: 150, price: 600 },
        { id: 'f6', airline: 'Ryanair', origin: 'WAW', destination: 'BCN', availableSeats: 2, price: 65 },
        { id: 'f7', airline: 'LOT', origin: 'WAW', destination: 'JFK', availableSeats: 34, price: 550 },
        { id: 'f8', airline: 'Air France', origin: 'KBP', destination: 'CDG', availableSeats: 8, price: 220 }
    ];

    async findAll(): Promise<FlightDTO[]> {
        return this.flights;
    }

    async findById(id: string): Promise<FlightDTO | undefined> {
        return this.flights.find(f => f.id === id);
    }

    //for BookingModule
    async updateSeats(id: string, delta: number): Promise<void> {
        const flight = await this.findById(id);
        if (flight) {
            flight.availableSeats += delta;
        }
    }
}

export const flightRepositoryInstance = new FlightRepository();