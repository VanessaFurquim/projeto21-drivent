import Joi from "joi";

export const postBookingSchema = Joi.object({
    roomId: Joi.number().integer().min(1).required()
})