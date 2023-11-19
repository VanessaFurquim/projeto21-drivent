import { ApplicationError } from '@/protocols';

export function paymentRequiredError(details: string): ApplicationError {
  return {
    name: 'PaymentRequiredError',
    message: `${details} required to continue!`,
  };
};