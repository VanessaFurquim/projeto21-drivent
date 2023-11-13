import { Ticket, TicketType } from "@prisma/client";
import { prisma } from '@/config';
import { CreateTicketParams } from "@/protocols";

async function findAllTicketTypes(): Promise<TicketType[]> {
    return prisma.ticketType.findMany();
};

async function findUsersEnrollmentData(userId: number) {
    return prisma.enrollment.findUnique({
        where: { userId }
    });
};

async function findUsersCurrentTicketByEnrollmentId(enrollmentId: number) {
    return prisma.ticket.findFirst({
        where: { enrollmentId },
        include: { TicketType: true }
    });
};

async function createTicket(ticketData: CreateTicketParams): Promise<Ticket & {TicketType: TicketType}> {
    return prisma.ticket.create({
        data: ticketData,
          include: {
            TicketType: true,
          },
    });
};

export const ticketsRepository = { findAllTicketTypes, findUsersEnrollmentData, findUsersCurrentTicketByEnrollmentId, createTicket };