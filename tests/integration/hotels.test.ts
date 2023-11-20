import faker from '@faker-js/faker';
import httpStatus from 'http-status';
import * as jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { createEnrollmentWithAddress, createHotel, createRoom, createTicket, createTicketType, createUser } from '../factories';
import { cleanDb, generateValidToken } from '../helpers';
import { prisma } from '@/config';
import app, { init } from '@/app';
import { TicketStatus } from '@prisma/client';

beforeAll(async () => {
    await init();
});

beforeEach(async () => {
    await cleanDb();
});

const server = supertest(app);

describe('GET /hotels', () => {
    it('should respond with status 401 if no token is given', async () => {
      const response = await server.get('/hotels');
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if given token is not valid', async () => {
      const token = faker.lorem.word();
  
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    it('should respond with status 401 if there is no session for given token', async () => {
      const userWithoutSession = await createUser();
      const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
      const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
      expect(response.status).toBe(httpStatus.UNAUTHORIZED);
    });
  
    describe('when token is valid', () => {
      it('should respond with status 404 when user doesnt have an enrollment yet', async () => {
        const token = await generateValidToken();
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });
  
      it('should respond with status 404 when user doesnt have a ticket yet', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        await createEnrollmentWithAddress(user);
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });

      it('should respond with status 404 when there are no hotels in the database', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, true);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        // test passes without createPayment
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.NOT_FOUND);
      });

      it('should respond with status 402 when payment not finalized', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType();
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const hotel = await createHotel();
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 402 when selected remote attendance to event', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(true);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.RESERVED);
        const hotel = await createHotel();
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
      });

      it('should respond with status 402 when does not include hotel', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, false);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        // test passes without createPayment
        const hotel = await createHotel();
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.PAYMENT_REQUIRED);
      });
  
      it('should respond with status 200 and with hotel data', async () => {
        const user = await createUser();
        const token = await generateValidToken(user);
        const enrollment = await createEnrollmentWithAddress(user);
        const ticketType = await createTicketType(false, true);
        const ticket = await createTicket(enrollment.id, ticketType.id, TicketStatus.PAID);
        // test passes without createPayment
        const hotel = await createHotel();
  
        const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
        expect(response.status).toEqual(httpStatus.OK);
        console.log("here")
        console.log(response.body)
        expect(response.body).toEqual([
            {
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
          }
        ]);
      });
    });
  });

  // describe('GET /hotels', () => {
  //   it('should respond with status 401 if no token is given', async () => {
  //     const response = await server.get('/hotels');
  
  //     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  //   });
  
  //   it('should respond with status 401 if given token is not valid', async () => {
  //     const token = faker.lorem.word();
  
  //     const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
  //     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  //   });
  
  //   it('should respond with status 401 if there is no session for given token', async () => {
  //     const userWithoutSession = await createUser();
  //     const token = jwt.sign({ userId: userWithoutSession.id }, process.env.JWT_SECRET);
  
  //     const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
  //     expect(response.status).toBe(httpStatus.UNAUTHORIZED);
  //   });
  
  //   describe('when token is valid', () => {
  //     it('should respond with status 404 when user doesnt have an enrollment yet', async () => {
  //       const token = await generateValidToken();
  
  //       const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
  //       expect(response.status).toEqual(httpStatus.NOT_FOUND);
  //     });
  
  //     it('should respond with status 404 when user doesnt have a ticket yet', async () => {
  //       const user = await createUser();
  //       const token = await generateValidToken(user);
  //       await createEnrollmentWithAddress(user);
  
  //       const response = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
  
  //       expect(response.status).toEqual(httpStatus.NOT_FOUND);
  //     });
  
  //     it('should respond with status 200 and with hotel data', async () => {
  //       const user = await createUser();
  //       const token = await generateValidToken(user);
  //       const enrollment = await createEnrollmentWithAddress(user);
  //       const hotel = await createHotel();
  //       const room = await createRoom(hotel.id);
  
  //       const response = await server.get('/tickets').set('Authorization', `Bearer ${token}`);
  
  //       expect(response.status).toEqual(httpStatus.OK);
  //       expect(response.body).toEqual({
  //         id: ticket.id,
  //         status: ticket.status,
  //         ticketTypeId: ticket.ticketTypeId,
  //         enrollmentId: ticket.enrollmentId,
  //         TicketType: {
  //           id: ticketType.id,
  //           name: ticketType.name,
  //           price: ticketType.price,
  //           isRemote: ticketType.isRemote,
  //           includesHotel: ticketType.includesHotel,
  //           createdAt: ticketType.createdAt.toISOString(),
  //           updatedAt: ticketType.updatedAt.toISOString(),
  //         },
  //         createdAt: ticket.createdAt.toISOString(),
  //         updatedAt: ticket.updatedAt.toISOString(),
  //       });
  //     });
  //   });
  // });