import { prisma } from '@/config';

async function findBookingByUserId(userId: any) {
  const bookingResult = await prisma.booking.findFirst({
    where: {
      userId,
    },
    include: {
      Room: true
    },
  });

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

export const bookingsRepository = {
    findBookingByUserId,
};