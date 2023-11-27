import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingsService } from '@/services';
import { InputPostBookingBody } from '@/protocols';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const booking = await bookingsService.getBooking(userId);
  res.status(httpStatus.OK).send(booking);
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const userId: number = req.userId;
  const roomId: number = parseInt(req.body.roomId);

  const inputPostBookingBody: InputPostBookingBody = {
    userId,
    roomId
  };

  const bookingId: number = await bookingsService.postBooking(inputPostBookingBody);

  res.status(httpStatus.OK).send({ bookingId });
}

export async function changeRoomInBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;
  const { roomId } = req.body;
  const bookingIdFromParams = parseInt(req.params.bookingId);

  const bookingId = await bookingsService.changeUsersBooking(userId, roomId, bookingIdFromParams);

  res.status(httpStatus.OK).send({ bookingId });
}