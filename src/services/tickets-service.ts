import { notFoundError } from "@/errors";
import { CreateTicketParams } from "@/protocols";
import { enrollmentRepository, ticketsRepository } from "@/repositories";
import { Enrollment, Ticket, TicketType } from "@prisma/client";

async function getTicketTypes(): Promise <TicketType[]> {
    const ticketTypes: TicketType[] = await ticketsRepository.findTicketTypes();
    return ticketTypes;
};

async function getTicketByUserId(userId: number): Promise<Ticket> {
    const enrollment: Enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticket: Ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw notFoundError();

    return ticket;
};

async function createTicket(userId: number, ticketTypeId: number): Promise <Ticket & { TicketType: TicketType }> {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticketData: CreateTicketParams = {
        ticketTypeId,
        enrollmentId: enrollment.id,
        status: 'RESERVED'
    };

    const ticket: Ticket & { TicketType: TicketType } = await ticketsRepository.createTicket(ticketData);
    return ticket;
};

export const ticketsService = {
    getTicketByUserId,
    getTicketTypes,
    createTicket
};