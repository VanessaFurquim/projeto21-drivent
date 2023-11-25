import app, { init } from "@/app";
import { cleanDb, generateValidToken } from "../helpers";
import supertest from "supertest";
import { prisma } from '@/config';
import httpStatus from 'http-status';
import faker from '@faker-js/faker';
import * as jwt from 'jsonwebtoken';
import { createEnrollmentWithAddress, createPayment, createTicket, createTicketType, createUser } from "../factories";
import { createBooking } from "../factories/bookings-factory";
import { Booking } from "@prisma/client";
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

        it('should respond with status 200 and the booking id the room data', async () => {
            const user = await createUser();
            const token = await generateValidToken(user);
            const hotel = await createHotel();
            const room = await createRoomWithHotelId(hotel.id);
            const mockBooking = await createBooking(user.id, room.id);

            const { status, body } = await server.get("/booking").set('Authorization', `Bearer ${token}`)
            console.log(body)
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