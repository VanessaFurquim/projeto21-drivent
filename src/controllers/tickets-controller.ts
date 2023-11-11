import { AuthenticatedRequest } from '@/middlewares';
import { ticketsService } from '@/services/tickets-service';
import { Ticket, TicketType } from '@prisma/client';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function getTicketTypes(_req: AuthenticatedRequest, res: Response) {
    // como tipar ?
  const allTicketTypes = await ticketsService.getTicketTypes();
  return res.status(httpStatus.OK).send(allTicketTypes);
};

export async function getUsersCurrentTicket(req: AuthenticatedRequest, res: Response) {
    // tipagem da função seria uma junção de Ticket e TicketType. Como fazer ?
 const { userId } = req;
//  como tipar como número ?

 const usersCurrentTicket: Ticket = await ticketsService.getUsersCurrentTicket(userId);

 return res.status(httpStatus.OK).send(usersCurrentTicket);
};

export async function createTicket(req: AuthenticatedRequest, res: Response) {
    const { userId } = req;
    const { ticketTypeId } = req.body;

    const newTicket = await ticketsService.createTicket(userId, ticketTypeId);

    return res.status(httpStatus.CREATED).send(newTicket);
};