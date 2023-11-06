import { Response } from 'express';
import httpStatus from 'http-status';
import { AuthenticatedRequest } from '@/middlewares';
import { enrollmentsService } from '@/services';
// import { invalidDataError } from '@/errors';
import { CEP } from '@/protocols';

export async function getEnrollmentByUser(req: AuthenticatedRequest, res: Response) {
  const { userId } = req;

  const enrollmentWithAddress = await enrollmentsService.getOneWithAddressByUserId(userId);

  return res.status(httpStatus.OK).send(enrollmentWithAddress);
}

// Como tipar esta função ?
export async function postCreateOrUpdateEnrollment(req: AuthenticatedRequest, res: Response) {
  await enrollmentsService.createOrUpdateEnrollmentWithAddress({
    ...req.body,
    userId: req.userId,
  });

  return res.sendStatus(httpStatus.OK);
}

// TODO - Receber o CEP do usuário por query params. DONE
export async function getAddressFromCEP(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { cep } = req.query as CEP

  const address = await enrollmentsService.getAddressFromCEP(cep);

    res.status(httpStatus.OK).send(address);
  
    // throw invalidDataError("Invalid CEP format!")
}
