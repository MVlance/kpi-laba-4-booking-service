//DTO
export interface CreateBookingDTO {
    userId: string;
    flightId: string;
    seatClass: string;
    serviceIds: string[];
}

export interface BookingDTO {
    id: string;
    userId: string;
    pnrCode: string;
    flightId: string;
    status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
    totalPrice: number;
    expiresAt: Date;
}

export class BookingRepository {
    // In-memory DB for prototype
    private bookings: BookingDTO[] = [];

    async save(booking: BookingDTO): Promise<BookingDTO> {
        this.bookings.push(booking);
        return booking;
    }

    async findById(id: string | string[]): Promise<BookingDTO | undefined> {
        return this.bookings.find(b => b.id === id);
    }

    async updateStatus(id: string | string[], status: BookingDTO["status"]): Promise<void> {
        const booking = await this.findById(id);
        if (booking) {
            booking.status = status;
        }
    }

    async deleteById(id: string | string[]): Promise<void> {
        this.bookings = this.bookings.filter((booking) => booking.id !== id);
    }

    async findByUserId(userId: string): Promise<BookingDTO[]> {
        return this.bookings.filter(b => b.userId === userId);
    }
}