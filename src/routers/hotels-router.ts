import { getHotelWithRooms, getListOfHotels } from "@/controllers";
import { authenticateToken } from "@/middlewares";
import { Router } from "express";

const hotelsRouter = Router();

hotelsRouter
    .all('/*', authenticateToken)
    .get('/', getListOfHotels)
    .get('/:hotelId', getHotelWithRooms);

export { hotelsRouter }