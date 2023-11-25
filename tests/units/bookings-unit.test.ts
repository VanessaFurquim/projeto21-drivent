import { bookingsRepository } from "@/repositories";
import { bookingsService } from "@/services";

beforeEach(() => {
    jest.clearAllMocks();
});

describe("get bookings unit tests", () => {
    it("should return user's booking with room details", async () => {
        
        const mockBooking = {
            id: 1,
            Room: {
              id: 1,
              name: 'Grand Suite',
              capacity: 3,
              hotelId: 1,
              createdAt: new Date(),
              updatedAt: new Date()
            }
        };

        jest.spyOn(bookingsRepository, "findBookingByUserId").mockResolvedValueOnce(mockBooking);
        const booking = await bookingsService.getBooking(1);
        expect(bookingsRepository.findBookingByUserId).toBeCalled();
        expect(booking).toEqual(mockBooking);
    });
});