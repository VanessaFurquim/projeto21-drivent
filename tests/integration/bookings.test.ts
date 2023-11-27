import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import { prisma } from '@/config';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { createEnrollmentWithAddress, createPayment, createTicket, createTicketType, createUser } from "../factories";
import { createBooking } from "../factories/bookings-factory";
import { TicketStatus } from "@prisma/client";
import { createHotel, createRoomWithHotelId } from "../factories/hotels-factory";

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe('GET /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        it('should respond with status 404 when user has no booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const { status } = await server.get("/booking").set('Authorization', `Bearer ${token}`)
            expect(status).toBe(httpStatus.NOT_FOUND)
        });

        it('should respond with status 200 and the booking id with the room data', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const mockBooking = await createBooking(user.id, room.id);

            const { status, body } = await server.get("/booking").set('Authorization', `Bearer ${token}`)
            expect(status).toBe(httpStatus.OK)
            expect(body).toEqual({
                id: mockBooking.id,
                Room: {
                  id: room.id,
                  name: room.name,
                  capacity: room.capacity,
                  hotelId: room.hotelId,
                  createdAt: room.createdAt.toISOString(),
                  updatedAt: room.updatedAt.toISOString(),
                }
            });
        });
    });
});

describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        // it('should respond with status 400 when body is not valid', async () => {
        //     const token = await generateValidToken();
        //     const body = { [faker.lorem.word()]: faker.lorem.word() };
        //     const response = await server.post('/enrollments').set('Authorization', `Bearer ${token}`).send(body);

        //     expect(response.status).toBe(httpStatus.BAD_REQUEST);
        // });

        it('should respond with status 404 when user has no booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const { status } = await server.get("/booking").set('Authorization', `Bearer ${token}`)
            expect(status).toBe(httpStatus.NOT_FOUND)
        });

        it('should respond with status 403 when ticket type is not in-person', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(true, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const { status } = await server.post("/booking").set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: room.id
            })
            expect(status).toBe(httpStatus.FORBIDDEN)
        });

        it('should respond with status 403 when hotel is not included', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, false);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);

            const { status } = await server.post("/booking").set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: 1
            })
            expect(status).toBe(httpStatus.FORBIDDEN)
        });

        it('should respond with status 403 when ticket STATUS is not PAID', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const { status } = await server.post("/booking").set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: room.id
            })
            expect(status).toBe(httpStatus.FORBIDDEN)
        });

        it('should respond with status 404 when roomId does not exist', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();

            const { status } = await server.post("/booking").set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: 999
            })
            expect(status).toBe(httpStatus.NOT_FOUND)
        });

        it('should respond with status 403 when there is no vacancy in room', async () => {
            const user1 = await createUser();
            const token1 = await generateValidToken(user1);
            const enrollment1 = await createEnrollmentWithAddress(user1);
            const ticketType1 = await createTicketType(false, true);
            const ticket1 = await createTicket(enrollment1.id, ticketType1.id, TicketStatus.PAID);
            const payment1 = await createPayment(ticket1.id, ticketType1.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id, 1);

            const user2 = await createUser();
            const token2 = await generateValidToken(user2);
            const enrollment2 = await createEnrollmentWithAddress(user2);
            const ticketType2 = await createTicketType(false, true);
            const ticket2 = await createTicket(enrollment2.id, ticketType2.id, TicketStatus.PAID);
            const payment2 = await createPayment(ticket2.id, ticketType2.price);
            const booking2 = await server.post("/booking").set('Authorization', `Bearer ${token2}`).send({
                userId: user2.id,
                roomId: room.id
            })

            const { status } = await server.post("/booking").set('Authorization', `Bearer ${token1}`).send({
                userId: user1.id,
                roomId: room.id
            })
            expect(status).toBe(httpStatus.FORBIDDEN)
        });


        it('should respond with status 200 and the booking id', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const { status, body } = await server.post("/booking").set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: room.id
            })
            expect(status).toBe(httpStatus.OK)
            expect(body).toMatchObject({
                "bookingId": expect.any(Number)
            });
        });
    });
});

describe('POST /booking', () => {
    it('should respond with status 401 if no token is given', async () => {
        const response = await server.get('/booking');

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if given token is not valid', async () => {
        const token = faker.lorem.word();

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('should respond with status 401 if there is no session for given token', async () => {
        const userWithoutSession = await createUser();
        const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);

        const response = await server.get('/booking').set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });

    describe('when token is valid', () => {
        // it('should respond with status 400 when body is not valid', async () => {
        //     const token = await generateValidToken();
        //     const body = { [faker.lorem.word()]: faker.lorem.word() };
        //     const response = await server.post('/enrollments').set('Authorization', `Bearer ${token}`).send(body);

        //     expect(response.status).toBe(httpStatus.BAD_REQUEST);
        // });

        it('should respond with status 404 when user has no booking', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);

            const { status } = await server.get("/booking").set('Authorization', `Bearer ${token}`)
            expect(status).toBe(httpStatus.NOT_FOUND)
        });

        it('should respond with status 403 when ticket type is not in-person', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(true, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room1 = await createRoomWithHotelId(hotel.id);
            const room2 = await createRoomWithHotelId(hotel.id);
            const bookingToBeChanged = await createBooking(user.id, room1.id);

            const { status } = await server.put(`/booking/${bookingToBeChanged.id}`).set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: room2.id
            })
            expect(status).toBe(httpStatus.FORBIDDEN)
        });

        it('should respond with status 403 when hotel is not included', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, false);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room1 = await createRoomWithHotelId(hotel.id);
            const room2 = await createRoomWithHotelId(hotel.id);
            const bookingToBeChanged = await createBooking(user.id, room1.id);

            const { status } = await server.put(`/booking/${bookingToBeChanged.id}`).set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: room2.id
            })
            expect(status).toBe(httpStatus.FORBIDDEN)
        });

        it('should respond with status 403 when ticket STATUS is not PAID', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room1 = await createRoomWithHotelId(hotel.id);
            const room2 = await createRoomWithHotelId(hotel.id);
            const bookingToBeChanged = await createBooking(user.id, room1.id);

            const { status } = await server.put(`/booking/${bookingToBeChanged.id}`).set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: room2.id
            })
            expect(status).toBe(httpStatus.FORBIDDEN)
        });

        it('should respond with status 404 when roomId does not exist', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const bookingToBeChanged = await createBooking(user.id, room.id);

            const { status } = await server.put(`/booking/${bookingToBeChanged.id}`).set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: 999
            })
            expect(status).toBe(httpStatus.NOT_FOUND)
        });

        it('should respond with status 403 when there is no vacancy in room', async () => {
            const user1 = await createUser();
            const token1 = await generateValidToken(user1);
            const enrollment1 = await createEnrollmentWithAddress(user1);
            const ticketType1 = await createTicketType(false, true);
            const ticket1 = await createTicket(enrollment1.id, ticketType1.id, TicketStatus.PAID);
            const payment1 = await createPayment(ticket1.id, ticketType1.price);

            const user2 = await createUser();
            const token2 = await generateValidToken(user2);
            const enrollment2 = await createEnrollmentWithAddress(user2);
            const ticketType2 = await createTicketType(false, true);
            const ticket2 = await createTicket(enrollment2.id, ticketType2.id, TicketStatus.PAID);
            const payment2 = await createPayment(ticket2.id, ticketType2.price);

            const hotel = await createHotel();

            const room1 = await createRoomWithHotelId(hotel.id, 1);
            const room2 = await createRoomWithHotelId(hotel.id, 1);

            const booking1 = await createBooking(user1.id, room1.id);
            const booking2 = await createBooking(user2.id, room2.id);

            const { status } = await server.put(`/booking/${booking1.id}`).set('Authorization', `Bearer ${token1}`).send({
                userId: user1.id,
                roomId: room2.id
            })
            expect(status).toBe(httpStatus.FORBIDDEN)
        });

        it('should respond with status 200 and the altered booking id', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const enrollment = await createEnrollmentWithAddress(user);
            const ticketType = await createTicketType(false, true);
            const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
            const payment = await createPayment(ticket.id, ticketType.price);
            const hotel = await createHotel();
            const room1 = await createRoomWithHotelId(hotel.id);
            const room2 = await createRoomWithHotelId(hotel.id);
            const bookingToBeChanged = await createBooking(user.id, room1.id);

            const { status, body } = await server.put(`/booking/${bookingToBeChanged.id}`).set('Authorization', `Bearer ${token}`).send({
                userId: user.id,
                roomId: room2.id
            })
            expect(status).toBe(httpStatus.OK)
            expect(body).toMatchObject({
                "bookingId": expect.any(Number)
            });
        });
    });
});