import { TicketType } from "@prisma/client";
import { ticketsRepository } from "@/repositories/tickets-repository";

async function getTicketTypes(): Promise<TicketType[]> {
    const result = await ticketsRepository.findAllTicketTypes();
    return (result);
}

export const ticketsService = { getTicketTypes };