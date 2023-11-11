import { AuthenticatedRequest } from '@/middlewares';
import { ticketsRouter } from '@/routers';
import { ticketsService } from '@/services/tickets-service';
import { TicketType } from '@prisma/client';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function getTicketTypes(_req: AuthenticatedRequest, res: Response) {
  const allTicketTypes = await ticketsService.getTicketTypes();
  return res.status(httpStatus.OK).send(allTicketTypes);
}