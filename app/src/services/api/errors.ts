import { ValidationError } from "@arkhn/ui/lib/Form/InputTypes";
import { FetchBaseQueryError } from "@rtk-incubator/rtk-query/dist";

export type ApiValidationError<T> = ValidationError<T> & {
  non_field_errors?: string[];
};

export const isApiValidationError = (error: FetchBaseQueryError): boolean =>
  error.status === 400;

export const apiValidationErrorFromResponse = <T>(
  error: FetchBaseQueryError
): ApiValidationError<T> | undefined => {
  if (isApiValidationError(error)) return error.data as ApiValidationError<T>;
};
