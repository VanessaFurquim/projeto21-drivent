import { notFoundError, unauthorizedError } from "@/errors";
import { bookingsRepository } from "@/repositories";

async function getBooking(userId: number) {
  if (!userId) throw unauthorizedError();

  const booking = await bookingsRepository.findBookingByUserId(userId);
  if (!booking) throw notFoundError();

  return booking;
}

export const bookingsService = {
  getBooking,
};