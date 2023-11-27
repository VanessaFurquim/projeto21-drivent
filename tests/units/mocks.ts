import faker from "@faker-js/faker";
import { generateCPF, getStates } from '@brazilian-utils/brazilian-utils';
import { Room, TicketStatus } from "@prisma/client";
import { createRoomWithHotelId } from "../factories/hotels-factory";


export const mockEnrollment = {
    id: 1,
    name: faker.name.findName(),
    cpf: generateCPF(),
    birthday: faker.date.past(),
    phone: faker.phone.phoneNumber('(##) 9####-####'),
    userId: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    Address: [
      {
        id: 1,
        street: faker.address.streetName(),
        cep: faker.address.zipCode(),
        city: faker.address.city(),
        neighborhood: faker.address.city(),
        addressDetail: faker.address.county(),
        number: faker.datatype.number().toString(),
        state: faker.helpers.arrayElement(getStates()).name,
        enrollmentId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
};

export const mockTicket_RESERVED = {
    id: 1,
    ticketTypeId: 1,
    enrollmentId: mockEnrollment.id,
    status: TicketStatus.RESERVED,
    createdAt: new Date(),
    updatedAt: new Date(),
    TicketType: {
      id: 1,
      name: faker.name.jobType(),
      price: 250,
      isRemote: false,
      includesHotel: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  export const mockTicket_PAID_ISREMOTE = {
    id: 1,
    ticketTypeId: 1,
    enrollmentId: mockEnrollment.id,
    status: TicketStatus.PAID,
    createdAt: new Date(),
    updatedAt: new Date(),
    TicketType: {
      id: 1,
      name: faker.name.jobArea(),
      price: 100,
      isRemote: true,
      includesHotel: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  export const mockTicket_PAID_INPERSON_NOHOTEL = {
    id: 1,
    ticketTypeId: 1,
    enrollmentId: mockEnrollment.id,
    status: TicketStatus.PAID,
    createdAt: new Date(),
    updatedAt: new Date(),
    TicketType: {
      id: 1,
      name: faker.name.jobArea(),
      price: 100,
      isRemote: false,
      includesHotel: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  export const mockTicket_PAID_INPERSON_INCLUDESHOTEL = {
    id: 1,
    ticketTypeId: 1,
    enrollmentId: mockEnrollment.id,
    status: TicketStatus.PAID,
    createdAt: new Date(),
    updatedAt: new Date(),
    TicketType: {
      id: 1,
      name: faker.name.jobArea(),
      price: 100,
      isRemote: false,
      includesHotel: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  };

  export const mockBooking = {
    id: 1,
    Room: {
        id: 1,
        name: faker.company.companyName(),
        capacity: faker.datatype.number(),
        hotelId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
    }
 };

 export const mockRoom = {
    id: 1,
        name: faker.company.companyName(),
        capacity: 3,
        hotelId: 1,
        createdAt: new Date(),
        updatedAt: new Date()
  };