import { AuthenticatedRequest } from '@/middlewares';
import { ticketsService } from '@/services/tickets-service';
import { Ticket, TicketType } from '@prisma/client';
import { Response } from 'express';
import httpStatus from 'http-status';

export async function getTicketTypes(_req: AuthenticatedRequest, res: Response): Promise<void> {
  const allTicketTypes: TicketType[] = await ticketsService.getTicketTypes();

  res.status(httpStatus.OK).send(allTicketTypes);
};

export async function getUsersCurrentTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId: number = req.userId;

    const usersCurrentTicket: Ticket = await ticketsService.getUsersCurrentTicket(userId);

    res.status(httpStatus.OK).send(usersCurrentTicket);
};

export async function createTicket(req: AuthenticatedRequest, res: Response): Promise<void> {
    const userId: number = req.userId;
    const ticketTypeId: number = req.body;

    const newTicket: Ticket = await ticketsService.createTicket(userId, ticketTypeId);

    res.status(httpStatus.CREATED).send(newTicket);
};