import faker from '@faker-js/faker';
import { prisma } from '@/config';

export async function createHotel() {
    return prisma.hotel.create({
        data: {
            name: `${faker.word.noun()} Hotel`,
            image: faker.image.imageUrl(),

        }
    });
}

export async function createRoom(hotelId: number) {
    return prisma.room.create({
        data: {
            name: `${faker.word.noun()} Suite`,
            capacity: faker.datatype.number({min: 1, max: 3}),
            hotelId
        }
    });
}