import { isRejectedWithValue, Middleware } from "@reduxjs/toolkit";

import { ApiValidationError } from "services/api/errors";

const rtkQueryErrorLogger: Middleware = () => (next) => (action) => {
  if (isRejectedWithValue(action)) {
    const { payload: error } = action;
    const { data: errorData, status: errorStatus } = error;
    const { endpointName } = action.meta.arg;
    console.log(endpointName);

    if (endpointName === "apiStructureDefinitionRetrieve") {
      errorData.issue.forEach((issue: any) =>
        console.log(errorStatus, issue.diagnostics)
      );
    } else if (
      endpointName === "apiResourcesRetrieve" ||
      endpointName === "apiAttributesRetrieve"
    ) {
      if (errorStatus === "PARSING_ERROR") {
        console.log(error.originalStatus, errorStatus, error.error);
      } else if (
        errorStatus === "FETCH_ERROR" ||
        errorStatus === "CUSTOM_ERROR"
      ) {
        console.log(errorStatus, error.error);
      } else {
        console.log(errorStatus, errorData.detail);
      }
    } else if (endpointName === "apiStaticInputsUpdate") {
      console.log(errorStatus, errorData.detail);
    } else if (
      endpointName === "apiAttributesCreate" ||
      endpointName === "apiAttributesList" ||
      endpointName === "apiInputGroupsList" ||
      endpointName === "apiInputGroupsCreate" ||
      endpointName === "apiInputGroupsUpdate" ||
      endpointName === "apiConditionsList" ||
      endpointName === "apiConditionsCreate" ||
      endpointName === "apiColumnsCreate" ||
      endpointName === "apiStaticInputsCreate"
    ) {
      const errors: ApiValidationError<string[]> = errorData;
      const errorEntries = Object.entries(errors);

      errorEntries.forEach(([key, text]) => {
        if (text) console.log(errorStatus, key, text.toString());
      });
    } else {
      console.log(action);
    }
  }
  return next(action);
};

export { rtkQueryErrorLogger };
