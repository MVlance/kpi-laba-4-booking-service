import { BookingRepository, type CreateBookingDTO, type BookingDTO } from './repository';
import { v4 as uuidv4 } from 'uuid';
import { flightRepositoryInstance } from '../search/repository'; // Підключаємо базу рейсів!

export class BookingService {
    constructor(private bookingRepo: BookingRepository) {}

    async createBooking(dto: CreateBookingDTO): Promise<BookingDTO> {
        // 1. searching for a flight
        const flight = await flightRepositoryInstance.findById(dto.flightId);

        // 2. checking the amount of seats
        if (!flight || flight.availableSeats <= 0) {
            throw new Error('Немає вільних місць на цей рейс');
        }

        // 3. one seat less
        await flightRepositoryInstance.updateSeats(dto.flightId, -1);

        // 4. creating booking
        const newBooking: BookingDTO = {
            id: uuidv4(),
            pnrCode: Math.random().toString(36).substring(2, 8).toUpperCase(),
            flightId: dto.flightId,
            status: 'PENDING',
            totalPrice: flight.price, // Беремо справжню ціну з рейсу!
            expiresAt: new Date(Date.now() + 15 * 60000)
        };

        return await this.bookingRepo.save(newBooking);
    }

    async cancelBooking(id: string): Promise<void> {
        const booking = await this.bookingRepo.findById(id);
        if (booking && booking.status !== 'CANCELLED') {
            await this.bookingRepo.updateStatus(id, 'CANCELLED');
            // returning the seat
            await flightRepositoryInstance.updateSeats(booking.flightId, 1);
        }
    }
}