import { Request, Response, NextFunction } from "express";
import yup from "yup";
import { ApiError } from "@helpers/apiErrorsHandler";

const validateDTO = (schema: yup.ObjectSchema<any>) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedBody = await schema.validate(req.body, {
        abortEarly: false,
        strict: true,
      });
      req.body = validatedBody;
      next();
    } catch (e: any) {
      next(ApiError.incorrectParameter(e.message || "Incorrect parameter"));
    }
  };
};

export { validateDTO };
