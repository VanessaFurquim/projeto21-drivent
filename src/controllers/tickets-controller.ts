import { AuthenticatedRequest } from '@/middlewares';
import { ticketsService } from '@/services/tickets-service';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function getTicketTypes(_req: AuthenticatedRequest, res: Response) {
  const allTicketTypes = await ticketsService.getTicketTypes();
  return res.status(httpStatus.OK).send(allTicketTypes);
};

export async function getUsersCurrentTicket(req: AuthenticatedRequest, res: Response) {
 const { userId } = req;

 const usersCurrentTicket = await ticketsService.getUsersCurrentTicket(userId);

 return res.status(httpStatus.OK).send(usersCurrentTicket);
};