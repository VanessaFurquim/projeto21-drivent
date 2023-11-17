import { Response } from 'express';
import { AuthenticatedRequest } from '@/middlewares';
import httpStatus from 'http-status';
import { hotelsService } from '@/services'

export async function getListOfHotels(req: AuthenticatedRequest, res: Response) {
    const userId: number = req.userId;

    const listOfHotels = await hotelsService.getListOfHotels(userId);
    return res.status(httpStatus.OK).send(listOfHotels);
};

// export async function getTicket(req: AuthenticatedRequest, res: Response) {
//     const { userId } = req;
//     const ticket = await ticketsService.getTicketByUserId(userId);
//     return res.status(httpStatus.OK).send();
// };