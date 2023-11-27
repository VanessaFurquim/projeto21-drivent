import { bookingsRepository, enrollmentRepository, ticketsRepository } from "@/repositories";
import { bookingsService } from "@/services";
import { User } from "@prisma/client";
import { mockBooking, mockEnrollment, mockRoom, mockTicket_PAID_INPERSON_INCLUDESHOTEL } from "./mocks";
import { InputBookingBody, InputChangeRoomInBookingBody } from "@/protocols";



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
    it("should throw 403 error when user has no enrollment", () => {
        jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockResolvedValueOnce(null);

        const userId: number = 1;
        
        const promise = bookingsService.validateBookingConditions(userId);
        
        expect(enrollmentRepository.findWithAddressByUserId).toBeCalled();
        expect(promise).rejects.toEqual({
            name: 'ForbiddenError',
            message: 'You must be enrolled to continue.'
        });
    });

    it("should throw 403 error when user has no ticket", async () => {
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

        const promise = await bookingsService.validateBookingConditions(user.id);

        expect(ticketsRepository.findTicketByEnrollmentId).toBeCalled();
        expect(promise).rejects.toEqual({
            name: 'ForbiddenError',
            message: 'You must have a ticket to continue.'
        });
    });

    it("should validate if user's ticket has status.PAID", async () => {

        
        
    });

    it("should validate if user's ticketis not remote", async () => {

        
        
    });

    it("should validate if user's ticket includes hotel reservation", async () => {

        
        
    });
});

describe("POST booking unit tests", () => {
    it("should return 403 (forbidden) error when user already has a booking", async () => {
        const inputBookingBody: InputBookingBody = {
            userId: 1,
            roomId: 1
        };

        jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
            return mockEnrollment;
        });

        jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
            return mockTicket_PAID_INPERSON_INCLUDESHOTEL;
        });

        jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(mockBooking);

        const promise = await bookingsService.postBooking(inputBookingBody);

        expect(bookingsRepository.findBookingByUserId).toBeCalled();
        expect(promise).rejects.toEqual({
            name: 'ForbiddenError',
            message: 'You are only allowed to have one booking.'
        });
    });

    // it("should return 404 (not found) error when selected room does not exist", async () => {
    //     const inputBookingBody: InputBookingBody = {
    //         userId: 1,
    //         roomId: 1
    //     };
    //     jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

    //     jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(null);

    //     const promise = await bookingsService.postBooking(inputBookingBody);

    //     expect(bookingsRepository.createBooking).toBeCalled();
    //     expect(promise).rejects.toEqual({
    //         name: "NotFoundError",
    //         message: 'No result for this search!'
    //       });
    // });

    // it("should return 403 (forbidden) error when selected new room is up to capacity", async () => {
    //     const inputBookingBody: InputBookingBody = {
    //         userId: 1,
    //         roomId: 1
    //     };

    //     jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

    //     jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(mockRoom);
        
    //     jest.spyOn(bookingsRepository, 'countBookingsByRoomId').mockResolvedValueOnce(3);

    //     const promise = await bookingsService.postBooking(inputBookingBody);

    //     expect(bookingsRepository.createBooking).toBeCalled();
    //     expect(promise).rejects.toEqual({
    //         name: "ForbiddenError",
    //         message: 'This room is up to capacity. Choose a room with vacancy.'
    //       });
    // });

    // it("should create booking and return status 200 and bookingId", async () => {
    //     const inputBookingBody: InputBookingBody = {
    //         userId: 1,
    //         roomId: 1
    //     };

    //     jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

    //     jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(mockRoom);
        
    //     jest.spyOn(bookingsRepository, 'countBookingsByRoomId').mockResolvedValueOnce(1);

    //     const promise = await bookingsService.postBooking(inputBookingBody);

    //     expect(bookingsRepository.createBooking).toBeCalled();
    //     expect(promise).toEqual(1);
    // });
});

// describe("PUT booking unit tests", () => {
//     it("should return 403 (forbidden) error when user does not have a booking", async () => {
//         const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
//             userId: 1,
//             roomId: 1,
//             bookingId: 1
//         };

//         jest.spyOn(enrollmentRepository, 'findWithAddressByUserId').mockImplementationOnce((): any => {
//             return mockEnrollment;
//         });

//         const x = jest.spyOn(ticketsRepository, 'findTicketByEnrollmentId').mockImplementationOnce((): any => {
//             return mockTicket_PAID_INPERSON_INCLUDESHOTEL;
//         });

//         jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

//         const promise = await bookingsService.postBooking(inputChangeRoomInBookingBody);

//         expect(bookingsRepository.findBookingByUserId).toBeCalled();
//         expect(promise).rejects.toEqual({
//             name: 'ForbiddenError',
//             message: 'You do not have a room reservation yet.'
//         });
//     });

//     // it("should return 403 (forbidden) error when there is a bookingId incompatibility", async () => {
//         // const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
//         //     userId: 1,
//         //     roomId: 1,
//         //     bookingId: 1
//         // };
//     //     jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(mockBooking);

//     //     jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(null);

//     //     const promise = await bookingsService.postBooking(inputChangeRoomInBookingBody);

//     //     expect(bookingsRepository.createBooking).toBeCalled();
//     //     expect(promise).rejects.toEqual({
//     //         name: "ForbiddenError",
//     //         message: 'You are not allowed to change this booking.'
//     //       });
//     // });

//     it("should return 404 (not found) error when selected room does not exist", async () => {
//         const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
//             userId: 1,
//             roomId: 1,
//             bookingId: 1
//         };

//         jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

//         jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(null);

//         const promise = await bookingsService.changeUsersBooking(inputChangeRoomInBookingBody);

//         expect(bookingsRepository.changeUsersBooking).toBeCalled();
//         expect(promise).rejects.toEqual({
//             name: "NotFoundError",
//             message: 'No result for this search!'
//           });
//     });

//     it("should return 403 (forbidden) error when selected new room is up to capacity", async () => {
//         const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
//             userId: 1,
//             roomId: 1,
//             bookingId: 1
//         };

//         jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

//         jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(mockRoom);
        
//         jest.spyOn(bookingsRepository, 'countBookingsByRoomId').mockResolvedValueOnce(3);

//         const promise = await bookingsService.changeUsersBooking(inputChangeRoomInBookingBody);

//         expect(bookingsRepository.createBooking).toBeCalled();
//         expect(promise).rejects.toEqual({
//             name: "ForbiddenError",
//             message: 'This room is up to capacity. Choose a room with vacancy.'
//           });
//     });

//     it("should create booking and return status 200 and bookingId", async () => {
//         const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody = {
//             userId: 1,
//             roomId: 1,
//             bookingId: 1
//         };

//         jest.spyOn(bookingsRepository, 'findBookingByUserId').mockResolvedValueOnce(null);

//         jest.spyOn(bookingsRepository, 'findRoomById').mockResolvedValueOnce(mockRoom);
        
//         jest.spyOn(bookingsRepository, 'countBookingsByRoomId').mockResolvedValueOnce(1);

//         const promise = await bookingsService.changeUsersBooking(inputChangeRoomInBookingBody);

//         expect(bookingsRepository.changeUsersBooking).toBeCalled();
//         expect(promise).toEqual(1);
//     });
// });