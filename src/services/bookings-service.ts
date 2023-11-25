import { notFoundError, unauthorizedError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";
import { bookingsRepository, enrollmentRepository, hotelRepository, ticketsRepository } from "@/repositories";
import { TicketStatus } from "@prisma/client";

async function getBooking(userId: number) {
  if (!userId) throw unauthorizedError();

  const booking = await bookingsRepository.findBookingByUserId(userId);
  if (!booking) throw notFoundError();

  return booking;
}

async function validateBookingConditions(userId: number) {
  const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
  if (!enrollment) throw forbiddenError('You must be enrolled to continue.');

  const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
  if (!ticket) throw forbiddenError('You must have a ticket to continue.');

  const type = ticket.TicketType;

  if (ticket.status === TicketStatus.RESERVED || type.isRemote || !type.includesHotel) {
    throw forbiddenError('You must have a paid in-person ticket with a hotel reservation to continue.');
  }
}

async function postBooking(userId: number, roomId: number) {
  if (!userId) throw unauthorizedError();

  await validateBookingConditions(userId);

  const doesUserAlreadyHaveBooking = bookingsRepository.findBookingByUserId(userId);
  if (doesUserAlreadyHaveBooking) throw forbiddenError('You are only allowed to have one booking.')

  const room = await bookingsRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  const roomCount = await bookingsRepository.findBookingsByRoomId(roomId);
  if (room.capacity === roomCount) throw forbiddenError('This room is up to capacity. Choose a room with vacancy.')

  return room;
}

export const bookingsService = {
  getBooking,
  postBooking
};