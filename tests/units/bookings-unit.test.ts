import { bookingsRepository, enrollmentRepository, ticketsRepository } from "@/repositories";
import { bookingsService } from "@/services";
import { User } from "@prisma/client";
import { mockBooking, mockEnrollment, mockRoom, mockTicket_PAID_INPERSON_INCLUDESHOTEL, mockTicket_PAID_INPERSON_NOHOTEL, mockTicket_PAID_ISREMOTE, mockTicket_RESERVED } from "./mocks";
import { InputBookingBody, InputChangeRoomInBookingBody } from "@/protocols";
import { notFoundError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";



beforeEach(() => {
    jest.clearAllMocks();
});

describe("GET bookings unit tests", () => {
    it("should return user's booking with room details", async () => {

        jest.spyOn(bookingsRepository, "findBookingByUserId").mockResolvedValueOnce(mockBooking);
        const booking = await bookingsService.getBooking(1);
        expect(bookingsRepository.findBookingByUserId).toBeCalled();
        expect(booking).toEqual(mockBooking);
    });
});

describe("validateBookingConditions function unit tests", () => {
    it("should throw 403 (forbidden) error when user has no enrollment", () => {
        jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(null);

        const userId: number = 1;
        
        const promise = bookingsService.validateBookingConditions(userId);
        
        expect(promise).rejects.toEqual(forbiddenError('You must be enrolled to continue.'));
    });

    it("should throw 403 (forbidden) error when user has no ticket", async () => {
        const user: User = {
            id: 1,
            email: 'user@test.com',
            password: 'string',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
            return mockEnrollment;
        });

        jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(null);

        const promise = bookingsService.validateBookingConditions(user.id);

        expect(promise).rejects.toEqual(forbiddenError('You must have a ticket to continue.'));
    });

    it("should throw error 403 (forbidden) error if user's ticket does not have status.PAID", async () => {
        const user: User = {
            id: 1,
            email: 'user@test.com',
            password: 'string',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
            return mockEnrollment;
        });

        jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicket_RESERVED);

        const promise = bookingsService.validateBookingConditions(user.id);

        expect(promise).rejects.toEqual(forbiddenError('You must have a paid in-person ticket with a hotel reservation to continue.'));
    });

    it("should throw 403 (forbidden) error if user's ticket is not in-person", async () => {
        const user: User = {
            id: 1,
            email: 'user@test.com',
            password: 'string',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
            return mockEnrollment;
        });

        jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicket_PAID_ISREMOTE);

        const promise = bookingsService.validateBookingConditions(user.id);

        expect(promise).rejects.toEqual(forbiddenError('You must have a paid in-person ticket with a hotel reservation to continue.'));
    });

    it("should throw 403 (forbidden) error if user's ticket includes hotel reservation", async () => {
        const user: User = {
            id: 1,
            email: 'user@test.com',
            password: 'string',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
            return mockEnrollment;
        });

        jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicket_PAID_INPERSON_NOHOTEL);

        const promise = bookingsService.validateBookingConditions(user.id);

        expect(promise).rejects.toEqual(forbiddenError('You must have a paid in-person ticket with a hotel reservation to continue.'));
    });

    it("should validate user's booking conditions", async () => {
        const user: User = {
            id: 1,
            email: 'user@test.com',
            password: 'string',
            createdAt: new Date(),
            updatedAt: new Date()
        };

        jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
            return mockEnrollment;
        });

        jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockResolvedValueOnce(mockTicket_PAID_INPERSON_INCLUDESHOTEL);

        const promise = bookingsService.validateBookingConditions(user.id);

        expect(promise).resolves.toBe(undefined);
    });
});

describe("POST booking unit tests", () => {
    it("should return 403 (forbidden) error when user already has a booking", () => {

        jest.spyOn(bookingsService,'validateBookingConditions').mockImplementationOnce(async () => {});

        const inputBookingBody: InputBookingBody = {
            userId: 1,
            roomId: 2
        };

        jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(mockBooking);

        const promise = bookingsService.postBooking(inputBookingBody);

        expect(promise).rejects.toEqual(forbiddenError('You are only allowed to have one booking.'));
    });

    it("should return 404 (not found) error when selected room does not exist", () => {
        jest.spyOn(bookingsService,'validateBookingConditions').mockImplementationOnce(async () => {});

        const inputBookingBody: InputBookingBody = {
            userId: 1,
            roomId: 1
        };

        jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

        jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(null);

        const promise = bookingsService.postBooking(inputBookingBody);

        expect(promise).rejects.toEqual(notFoundError());
    });

    it("should return 403 (forbidden) error when selected new room is up to capacity", () => {
        jest.spyOn(bookingsService,'validateBookingConditions').mockImplementationOnce(async () => {});

        const inputBookingBody: InputBookingBody = {
            userId: 1,
            roomId: 1
        };

        jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

        jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(mockRoom);
        
        jest.spyOn(bookingsRepository, 'countBookingsByRoomId').mockResolvedValueOnce(3);

        const promise = bookingsService.postBooking(inputBookingBody);

        expect(promise).rejects.toEqual(forbiddenError('This room is up to capacity. Choose a room with vacancy.'));
    });

    it("should create booking and return status 200 and bookingId", async () => {
        jest.spyOn(bookingsService,'validateBookingConditions').mockImplementationOnce(async () => {});

        const inputBookingBody: InputBookingBody = {
            userId: 1,
            roomId: 1
        };

        jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

        jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(mockRoom);
        
        jest.spyOn(bookingsRepository, 'countBookingsByRoomId').mockResolvedValueOnce(1);

        jest.spyOn(bookingsRepository, 'createBooking').mockResolvedValueOnce(mockBooking);

        const promise = bookingsService.postBooking(inputBookingBody);

        expect(promise).resolves.toEqual(1);
    });
});

describe("PUT booking unit tests", () => {
    it("should return 403 (forbidden) error when user does not have a booking", async () => {
        jest.spyOn(bookingsService,'validateBookingConditions').mockImplementationOnce(async () => {});

        const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
            userId: 1,
            roomId: 1,
            bookingId: 1
        };

        jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

        const promise = bookingsService.changeUsersBooking(inputChangeRoomInBookingBody);

        expect(promise).rejects.toEqual(forbiddenError('You do not have a room reservation yet.'));
    });

    // it("should return 403 (forbidden) error when there is a bookingId incompatibility", async () => {
    //     jest.spyOn(bookingsService,'validateBookingConditions').mockImplementationOnce(async () => {});

    //     const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
    //         userId: 1,
    //         roomId: 1,
    //         bookingId: 1
    //     };

    //     jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(mockBooking);


    //     const promise = bookingsService.changeUsersBooking(inputChangeRoomInBookingBody);

    //     expect(promise).rejects.toEqual(forbiddenError('You do not have a room reservation yet.'));
    // });

    it("should return 404 (not found) error when selected room does not exist", async () => {
        jest.spyOn(bookingsService,'validateBookingConditions').mockImplementationOnce(async () => {});

        const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
            userId: 1,
            roomId: 1,
            bookingId: 1
        };

        jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(mockBooking);

        jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(null);

        const promise = bookingsService.changeUsersBooking(inputChangeRoomInBookingBody);

        expect(promise).rejects.toEqual(notFoundError());
    });

    it("should return 403 (forbidden) error when selected new room is up to capacity", async () => {
        jest.spyOn(bookingsService,'validateBookingConditions').mockImplementationOnce(async () => {});

        const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
            userId: 1,
            roomId: 1,
            bookingId: 1
        };

        jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(mockBooking);

        jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(mockRoom);

        jest.spyOn(bookingsRepository, 'countBookingsByRoomId').mockResolvedValueOnce(3);

        const promise = bookingsService.changeUsersBooking(inputChangeRoomInBookingBody);

        expect(promise).rejects.toEqual(forbiddenError('This room is up to capacity. Choose a room with vacancy.'));
    });

    it("should create booking and return status 200 and bookingId", async () => {
        jest.spyOn(bookingsService,'validateBookingConditions').mockImplementationOnce(async () => {});

        const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
            userId: 1,
            roomId: 1,
            bookingId: 1
        };

        jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(mockBooking);

        jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(mockRoom);

        jest.spyOn(bookingsRepository, 'countBookingsByRoomId').mockResolvedValueOnce(1);

        jest.spyOn(bookingsRepository, 'changeUsersBooking').mockResolvedValueOnce(mockBooking);

        const promise = bookingsService.changeUsersBooking(inputChangeRoomInBookingBody);

        expect(promise).resolves.toEqual(1);
    });
});