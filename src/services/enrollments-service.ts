import { Address, Enrollment } from '@prisma/client';
import { request } from '@/utils/request';
import { notFoundError, invalidDataError } from '@/errors';
import { addressRepository, CreateAddressParams, enrollmentRepository, CreateEnrollmentParams } from '@/repositories';
import { exclude } from '@/utils/prisma-utils';

// TODO - Receber o CEP por parâmetro nesta função. DONE
async function getAddressFromCEP(cep: string) {
  // FIXME: está com CEP fixo! DONE

  const result = await request.get(`${process.env.VIA_CEP_API}/${cep}/json/`);

  console.log(result.data)
  // TODO: Tratar regras de negócio e lançar eventuais erros
  // cep é existente ?
  if (result.data.erro === true) throw invalidDataError("This CEP does not exist!");

  // FIXME: não estamos interessados em todos os campos DONE
    return {
      logradouro: result.data.logradouro,
      complemento: result.data.complemento,
      bairro: result.data.bairro,
      cidade: result.data.localidade,
      uf: result.data.uf,
    };
}

async function getOneWithAddressByUserId(userId: number): Promise<GetOneWithAddressByUserIdResult> {
  const enrollmentWithAddress = await enrollmentRepository.findWithAddressByUserId(userId);

  if (!enrollmentWithAddress) throw notFoundError();

  const [firstAddress] = enrollmentWithAddress.Address;
  const address = getFirstAddress(firstAddress);

  return {
    ...exclude(enrollmentWithAddress, 'userId', 'createdAt', 'updatedAt', 'Address'),
    ...(!!address && { address }),
  };
}

type GetOneWithAddressByUserIdResult = Omit<Enrollment, 'userId' | 'createdAt' | 'updatedAt'>;

function getFirstAddress(firstAddress: Address): GetAddressResult {
  if (!firstAddress) return null;

  return exclude(firstAddress, 'createdAt', 'updatedAt', 'enrollmentId');
}

type GetAddressResult = Omit<Address, 'createdAt' | 'updatedAt' | 'enrollmentId'>;

async function createOrUpdateEnrollmentWithAddress(params: CreateOrUpdateEnrollmentWithAddress) {
  const enrollment = exclude(params, 'address');
  enrollment.birthday = new Date(enrollment.birthday);
  const address = getAddressForUpsert(params.address);

  console.log(address)

  // TODO - Verificar se o CEP é válido antes de associar ao enrollment.

  const newEnrollment = await enrollmentRepository.upsert(params.userId, enrollment, exclude(enrollment, 'userId'));

  await addressRepository.upsert(newEnrollment.id, address, address);
}

function getAddressForUpsert(address: CreateAddressParams) {
  return {
    ...address,
    ...(address?.addressDetail && { addressDetail: address.addressDetail }),
  };
}

export type CreateOrUpdateEnrollmentWithAddress = CreateEnrollmentParams & {
  address: CreateAddressParams;
};

export const enrollmentsService = {
  getOneWithAddressByUserId,
  createOrUpdateEnrollmentWithAddress,
  getAddressFromCEP,
};
