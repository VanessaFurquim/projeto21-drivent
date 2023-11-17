import { prisma } from '@/config';

async function findAllHotels() {
    const result = await prisma.hotel.findMany();
    return result;
};

export const hotelsRepository = {
    findAllHotels
};