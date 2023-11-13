import { Ticket, TicketStatus, TicketType } from "@prisma/client";
import { ticketsRepository } from "@/repositories/tickets-repository";
import { Enrollment } from "@prisma/client";
import { conflictError, invalidDataError, notFoundError } from "@/errors";
import { enrollmentRepository } from "@/repositories";
import { CreateTicketParams } from "@/protocols";

async function getTicketTypes(): Promise<TicketType[]> {
    const result: TicketType[] = await ticketsRepository.findAllTicketTypes();
    return (result);
};

async function getUsersCurrentTicket(userId: number): Promise<Ticket> {
    const usersEnrollmentData: Enrollment = await ticketsRepository.findUsersEnrollmentData(userId);

    if (usersEnrollmentData === null) throw notFoundError();

    let enrollmentId: number = usersEnrollmentData.id;

    const usersCurrentTicket: Ticket = await ticketsRepository.findUsersCurrentTicketByEnrollmentId(enrollmentId);

    if (usersCurrentTicket === null) throw notFoundError();
    
    return (usersCurrentTicket);
};

async function createTicket(userId: number, ticketTypeId: number): Promise<Ticket & {TicketType: TicketType}> {
    if (!ticketTypeId) throw invalidDataError("ticketType id");

    const usersEnrollmentData: Enrollment = await enrollmentRepository.findWithAddressByUserId(userId);

    if (!usersEnrollmentData) throw notFoundError();

    const ticketData: CreateTicketParams = {
        enrollmentId: usersEnrollmentData.id,
        ticketTypeId,
        status: TicketStatus.RESERVED
    };

    const isEnrollmentExistent: Ticket & { TicketType: TicketType } = await ticketsRepository.findUsersCurrentTicketByEnrollmentId(usersEnrollmentData.id);
    console.log(isEnrollmentExistent)
    if (isEnrollmentExistent) throw conflictError("There is already a ticket associated with this enrollment!");

    const newTicket: Ticket & {TicketType: TicketType} = await ticketsRepository.createTicket(ticketData);

    return newTicket;
};

export const ticketsService = { getTicketTypes, getUsersCurrentTicket, createTicket };