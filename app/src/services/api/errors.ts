import type { ValidationError } from "@arkhn/ui/lib/Form/InputTypes";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

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
