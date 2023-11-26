import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { changeRoomInBooking, getBooking, postBooking } from '@/controllers';
import { postBookingSchema } from '@/schemas';

const bookingsRouter = Router();

bookingsRouter
    .all('/*', authenticateToken)
    .get('/', getBooking)
    .post('/', postBooking) // validateBody
    .put('/:bookingId', changeRoomInBooking); // validateBody

export { bookingsRouter };