import { Router } from 'express';
import { authenticateToken } from '@/middlewares';
import { createTicket, getTicketTypes, getUsersCurrentTicket } from '@/controllers/tickets-controller';
// validateBody
// import { createOrUpdateEnrollmentSchema } from '@/schemas';

const ticketsRouter = Router();

ticketsRouter
  .all('/*', authenticateToken)
  .get('/types', getTicketTypes)
  .get('/', getUsersCurrentTicket)
  .post('/', createTicket);

export { ticketsRouter };
