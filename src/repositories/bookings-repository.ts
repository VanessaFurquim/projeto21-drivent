import { prisma } from '@/config';
import { notFoundError } from '@/errors';

async function findBookingByUserId(userId: number) {
  const bookingResult = await prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true
    },
  });

  if (!bookingResult) return null;

  return {
    id: bookingResult.id,
    Room: {
      id: bookingResult.Room.id,
      name: bookingResult.Room.name,
      capacity: bookingResult.Room.capacity,
      hotelId: bookingResult.Room.hotelId,
      createdAt: bookingResult.Room.createdAt,
      updatedAt: bookingResult.Room.updatedAt,
    }
  };
}

async function findRoomById(id: number) {
  const room = await prisma.room.findFirst({
    where: { id }
  });

  return room;
}

async function countBookingsByRoomId(roomId: number) {
  const roomCount = await prisma.booking.count({
    where: {
      roomId,
    },
  });

  return roomCount;
}

async function createBooking(userId: number, roomId: number) {
  const newBooking = await prisma.booking.create({
    data: {
      userId,
      roomId
    },
    include: {
      Room: true
    }
  });
  console.log(newBooking)

  return newBooking;
}

async function changeUsersBooking(bookingId: number, roomId: number) {
  const changedBookingData = await prisma.booking.update({
    where: {
      id: bookingId
    },
    data: {
      roomId
    },
    include: {
      Room: true
    }
  });

  return changedBookingData;
}

export const bookingsRepository = {
    findBookingByUserId,
    findRoomById,
    countBookingsByRoomId,
    createBooking,
    changeUsersBooking
};