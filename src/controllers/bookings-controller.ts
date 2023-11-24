import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingsService } from '@/services';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const booking = await bookingsService.getBooking(userId);
  res.status(httpStatus.OK).send(booking);
}

// export async function postBooking(req: AuthenticatedRequest, res: Response) {
//   const { userId } = req;
//   const hotelId = Number(req.params.hotelId);

//   const hotelWithRooms = await bookingsService.getHotelsWithRooms(userId, hotelId);
//   res.status(httpStatus.OK).send(hotelWithRooms);
// }