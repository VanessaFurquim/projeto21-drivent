import { Ticket, TicketType } from "@prisma/client";
import { ticketsRepository } from "@/repositories/tickets-repository";
import { Enrollment } from "@prisma/client";
import { notFoundError } from "@/errors";

async function getTicketTypes(): Promise<TicketType[]> {
    const result = await ticketsRepository.findAllTicketTypes();
    return (result);
};

async function getUsersCurrentTicket(userId: number): Promise<Ticket> {
    const usersEnrollmentData: Enrollment = await ticketsRepository.findUsersEnrollmentData(userId);

    if (usersEnrollmentData === null) throw notFoundError();

    let enrollmentId: number = usersEnrollmentData.id;

    const usersCurrentTicket = await ticketsRepository.findUsersCurrentTicket(enrollmentId);

    if (usersCurrentTicket === null) throw notFoundError();
    
    return (usersCurrentTicket);
};

export const ticketsService = { getTicketTypes, getUsersCurrentTicket };