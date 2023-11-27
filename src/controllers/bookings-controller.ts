import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { bookingsService } from '@/services';
import { InputBookingBody, InputChangeRoomInBookingBody } from '@/protocols';

export async function getBooking(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const booking = await bookingsService.getBooking(userId);
  res.status(httpStatus.OK).send(booking);
}

export async function postBooking(req: AuthenticatedRequest, res: Response) {
  const userId: number = req.userId;
  const roomId: number = parseInt(req.body.roomId);

  const inputPostBookingBody: InputBookingBody = {
    userId,
    roomId
  };

  const bookingId: number = await bookingsService.postBooking(inputPostBookingBody);

  res.status(httpStatus.OK).send({ bookingId });
}

export async function changeRoomInBooking(req: AuthenticatedRequest, res: Response) {
  const userId: number = req.userId;
  const roomId: number = req.body.roomId;
  const bookingIdFromParams: number = parseInt(req.params.bookingId);

  const inputChangeRoomInBookingBody: InputChangeRoomInBookingBody= {
    userId,
    roomId,
    bookingId: bookingIdFromParams
  }

  const id: number = await bookingsService.changeUsersBooking(inputChangeRoomInBookingBody)

  res.status(httpStatus.OK).send( { id } );
}