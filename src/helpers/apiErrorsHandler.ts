import { Request, Response, NextFunction } from "express";
import { logger } from "@logger/index";

class ApiError {
	constructor(
		public message: string,
		public status: number,
		public code: string
	) {
		this.message = message;
		this.status = status;
		this.code = code;
	}

	static incorrectParameter(message: string) {
		return new ApiError(message, 400, "INCORRECT_PARAMETER");
	}
}

const apiErrorsHandler = (
	err: any,
	req: Request,
	res: Response,
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	next: NextFunction
) => {
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
	logger.error(`Error in ${req.method} ${req.originalUrl}`);
	logger.error(err);
	responseJSON.error = "Unexpected error";
	responseJSON.errorCode = "UNEXPECTED_ERROR";
	return res.status(500).json(responseJSON);
};

export { apiErrorsHandler, ApiError };
