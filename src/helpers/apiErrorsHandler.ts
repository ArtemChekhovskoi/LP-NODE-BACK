import { Request, Response } from "express";

class ApiError {
  constructor(
    public message: string,
    public status: number,
    public code: string,
  ) {
    this.message = message;
    this.status = status;
    this.code = code;
  }

  static incorrectParameter(message: string) {
    return new ApiError(message, 400, "INCORRECT_PARAMETER");
  }
}

const apiErrorsHandler = (err: any, req: Request, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  if (err instanceof ApiError) {
    responseJSON.error = err.message;
    responseJSON.errorCode = err.code;
    return res.status(err.status).json(responseJSON);
  }
  responseJSON.error = "Unexpected error";
  responseJSON.errorCode = "UNEXPECTED_ERROR";
  return res.status(500).json(responseJSON);
};

export { apiErrorsHandler, ApiError };
