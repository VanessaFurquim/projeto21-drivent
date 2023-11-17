import { ApplicationError } from '@/protocols';

export function paymentRequiredError(details: string): ApplicationError {
  return {
    name: 'paymentRequiredError',
    message: `${details} required to continue!`,
  };
};