import { Ticket, TicketStatus, TicketType } from "@prisma/client";
import { ticketsRepository } from "@/repositories/tickets-repository";
import { Enrollment } from "@prisma/client";
import { conflictError, invalidDataError, notFoundError } from "@/errors";
// import { CreateTicketParams } from "@/protocols";
import { enrollmentRepository } from "@/repositories";

async function getTicketTypes(): Promise<TicketType[]> {
    const result = await ticketsRepository.findAllTicketTypes();
    return (result);
};

async function getUsersCurrentTicket(userId: number): Promise<Ticket> {
    const usersEnrollmentData: Enrollment = await ticketsRepository.findUsersEnrollmentData(userId);

    if (usersEnrollmentData === null) throw notFoundError();

    let enrollmentId: number = usersEnrollmentData.id;

    const usersCurrentTicket = await ticketsRepository.findUsersCurrentTicketByEnrollmentId(enrollmentId);

    if (usersCurrentTicket === null) throw notFoundError();
    
    return (usersCurrentTicket);
};

async function createTicket(userId: number, ticketTypeId: number) {
    if (!ticketTypeId) throw invalidDataError("ticketType id");

    const usersEnrollmentData = await enrollmentRepository.findWithAddressByUserId(userId);
    // console.log(usersEnrollmentData)
    if (!usersEnrollmentData) throw notFoundError();

    const ticketData = {
        enrollmentId: usersEnrollmentData.id,
        ticketTypeId,
        status: TicketStatus.RESERVED
    };

    const isEnrollmentRegistered = await ticketsRepository.findUsersCurrentTicketByEnrollmentId(usersEnrollmentData.id);
    if (isEnrollmentRegistered) throw conflictError("There is already a ticket associated with this enrollment!");
    
    const newTicket = await ticketsRepository.createTicket(ticketData);

    return newTicket;
};

// Criar ticket:

// deve conter:
//              informações do TicketType (salvo na tabela TicketType, associado ao enrollmentId do usuário)
//              informações do Ticket > id, createdAt, updatedAt criados na tabela;
//                                      status = "RESERVED";
//                                      ticketTypeId recebido pelo body;
//                                      enrollmentId adquirido em busca pelo userId em Enrollment 
// recebo userId pelo req
// // busco enrollmentId em Enrollment pelo userId echeco se usuário está cadastrado (senão, erro 404)
// const usersEnrollmentData = await enrollmentRepository.findWithAddressByUserId(userId);
// if (!usersEnrollmentData) throw notFoundError();
// recebo ticketTypeId pelo body
// busco o TicketType pelo id e checo se ticketTyperId foi enviado (senão, erro 400)
// const ticketTypeData = await ticketsRepository.findticketType(ticketTyperId);
// if (ticketTypeData === null) throw invalidDatError();
// faço inserção das informações do ticket na tabela Ticket
// const ticket = {
//                  enrollmentId: usersEnrollmentData.id,
//                  ticketTypeId,
//                  status: TicketStatus.RESERVED
//                }
// retorno essas informações e as informações do TicketType
// prisma.ticket.create({
//     data: ticket,
//     include: {
//       TicketType: true,
//     },
// });

export const ticketsService = { getTicketTypes, getUsersCurrentTicket, createTicket };