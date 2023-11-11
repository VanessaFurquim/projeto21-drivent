import { Enrollment, TicketType } from "@prisma/client";
import { prisma } from '@/config';

async function findAllTicketTypes(): Promise<TicketType[]> {
    return prisma.ticketType.findMany();
};

async function findUsersEnrollmentData(userId: number) {
    return prisma.enrollment.findUnique({
        where: { userId }
    });
};

async function findUsersCurrentTicket(enrollmentId: number) {
    return prisma.ticket.findFirst({
        where: { enrollmentId },
        include: { TicketType: true }
    });
}

export const ticketsRepository = { findAllTicketTypes, findUsersEnrollmentData, findUsersCurrentTicket };