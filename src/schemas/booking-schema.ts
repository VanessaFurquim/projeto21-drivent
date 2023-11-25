import { BookingInput } from "@/protocols";
import Joi from "joi";

export const postBookingSchema = Joi.object<BookingInput>({
    roomId: Joi.number().integer().min(1).required()
})