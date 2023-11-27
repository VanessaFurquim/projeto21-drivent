import { notFoundError, unauthorizedError } from "@/errors";
import { forbiddenError } from "@/errors/forbidden-error";
import { InputBookingBody } from "@/protocols";
import { bookingsRepository, enrollmentRepository, hotelRepository, ticketsRepository, userRepository } from "@/repositories";
import { TicketStatus } from "@prisma/client";

async function getBooking(userId: number) {
  // if (!userId) throw unauthorizedError();
  // body is not valid error

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
  };
};

async function postBooking(inputPostBookingBody: InputBookingBody) {
  // if (!userId) throw unauthorizedError();
  // body is not valid error
  const { userId, roomId } = inputPostBookingBody;

  await validateBookingConditions(userId);

  const doesUserAlreadyHaveBooking = await bookingsRepository.findBookingByUserId(userId);
  if (doesUserAlreadyHaveBooking) throw forbiddenError('You are only allowed to have one booking.')

  const room = await bookingsRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  const roomCount = await bookingsRepository.countBookingsByRoomId(roomId);
  if (room.capacity === roomCount) throw forbiddenError('This room is up to capacity. Choose a room with vacancy.');

  const { id } = await bookingsRepository.createBooking(userId, roomId);

  return id;
}

async function changeUsersBooking(userId: number, roomId: number, bookingId: number) {
  // if (!userId) throw unauthorizedError();
    // body is not valid error

  await validateBookingConditions(userId);

  const doesUserAlreadyHaveBooking = await bookingsRepository.findBookingByUserId(userId);
  if (!doesUserAlreadyHaveBooking) throw forbiddenError('You do not have a room reservation yet.')
  if (bookingId !== doesUserAlreadyHaveBooking.id) throw forbiddenError('You are not allowed to change this booking.');

  const room = await bookingsRepository.findRoomById(roomId);
  if (!room) throw notFoundError();

  const roomReservationCount = await bookingsRepository.countBookingsByRoomId(roomId);
  if (room.capacity === roomReservationCount) throw forbiddenError('This room is up to capacity. Choose a room with vacancy.');

  const { id } = await bookingsRepository.changeUsersBooking(bookingId, roomId);

  return id;
}

export const bookingsService = {
  getBooking,
  validateBookingConditions,
  postBooking,
  changeUsersBooking
};