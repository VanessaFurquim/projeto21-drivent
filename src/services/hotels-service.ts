import { notFoundError, paymentRequiredError } from '@/errors';
import { enrollmentRepository, hotelsRepository, ticketsRepository } from '@/repositories';
import { Enrollment, Ticket } from '@prisma/client';


async function getListOfHotels(userId: number) {

    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();
    console.log(enrollment)

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    console.log(ticket)
    if (!ticket) throw notFoundError();
    if (ticket.status !== 'PAID') throw paymentRequiredError('Payment');
    if (ticket.TicketType.includesHotel !== true) throw paymentRequiredError('Hotel');
    if (ticket.TicketType.isRemote === true) throw paymentRequiredError('Hotel');

    const listOfHotels = await hotelsRepository.findAllHotels();
    if (listOfHotels.length === 0) throw notFoundError();
    console.log (listOfHotels);
};

async function getHotelByUserId(userId: number, hotelId: number) {
    const enrollment = await enrollmentRepository.findWithAddressByUserId(userId);
    if (!enrollment) throw notFoundError();

    const ticket = await ticketsRepository.findTicketByEnrollmentId(enrollment.id);
    if (!ticket) throw notFoundError();
    if (ticket.TicketType.includesHotel !== true) throw paymentRequiredError('Hotel');
    if (ticket.status !== 'PAID') throw paymentRequiredError('Payment');
    if (ticket.TicketType.isRemote === true) throw paymentRequiredError('Hotel');

    const hotelWithRooms = await hotelsRepository.findHotelById(hotelId);

    return hotelWithRooms;
};

export const hotelsService = {
    getListOfHotels,
    getHotelByUserId
};