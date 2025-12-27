export type RipioErrorResponse = {
  code: number;
  type: string;
  detail: {
    message: string;
    code: string;
  };
  status: number;
};

export function notAuthenticated(): RipioErrorResponse {
  return {
    code: 40001,
    type: "NotAuthenticated",
    detail: {
      message: "Authentication credentials were not provided.",
      code: "not_authenticated",
    },
    status: 403,
  };
}

export function notEnoughBalance(message = "Not enough balance."): RipioErrorResponse {
  return {
    code: 20012,
    type: "NotEnoughBalance",
    detail: {
      message,
      code: "not_enough_balance",
    },
    status: 400,
  };
}

export function validationError(message: string): RipioErrorResponse {
  return {
    code: 20000,
    type: "ValidationError",
    detail: {
      message,
      code: "validation_error",
    },
    status: 400,
  };
}

export function notFound(message: string): RipioErrorResponse {
  return {
    code: 20000,
    type: "NotFound",
    detail: {
      message,
      code: "not_found",
    },
    status: 404,
  };
}

