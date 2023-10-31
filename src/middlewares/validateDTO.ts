import { Request, Response, NextFunction } from "express";
import yup from "yup";
import { ApiError } from "@helpers/apiErrorsHandler";

type DTOType = "body" | "query" | "params";
const validateDTO = (schema: yup.ObjectSchema<any>, type: DTOType = "body") => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedDTO = await schema.validate(req[type], {
        abortEarly: false,
        strict: true,
      });
      req[type] = validatedDTO;
      next();
    } catch (e: any) {
      next(ApiError.incorrectParameter(e.message || "Incorrect parameter"));
    }
  };
};

export { validateDTO };
