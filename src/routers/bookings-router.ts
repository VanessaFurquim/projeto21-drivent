import { Router } from 'express';
import { authenticateToken, validateBody } from '@/middlewares';
import { getBooking, postBooking } from '@/controllers';
import { postBookingSchema } from '@/schemas';

const bookingsRouter = Router();

bookingsRouter
    .all('/*', authenticateToken)
    .get('/', getBooking)
    .post('/', postBooking)
    .put('/:bookingId');

export { bookingsRouter };