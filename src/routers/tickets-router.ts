import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { getTicketTypes } from '@/controllers/tickets-controller';
// validateBody
// import { createOrUpdateEnrollmentSchema } from '@/schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketTypes)
//   .get('/tickets')
//   .post('/tickets');

export { ticketsRouter };
