import { notFoundError, paymentRequiredError } from '@/errors';
import { enrollmentRepository, hotelsRepository, ticketsRepository } from '@/repositories';
import { Enrollment, Ticket } from '@prisma/client';


async function getListOfHotels(userId: number) {

    const enrollment: Enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticket: Ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw notFoundError();
    // add no hotel condition 404
    if (ticket.status !== 'PAID') throw paymentRequiredError('Payment');
    // add isRemote = true and includesHotel = false conditions 402

    const listOfHotels = await hotelsRepository.findAllHotels();
    return listOfHotels;
};

// async function getTicketByUserId(userId: number) {
//     const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
//     if (!enrollment) throw notFoundError();

//     const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
//     if (!ticket) throw notFoundError();

//     return ticket;
// };

export const hotelsService = {
    getListOfHotels
};