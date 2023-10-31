import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Users } from "@models/users";
import { REGISTRATION_STEPS } from "@constants/user";

const postUpdateRegistrationStep = async (
  req: ExtendedRequest,
  res: Response,
) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  try {
    const { registrationStep } = req.body;
    const { usersID } = req;

    await Users.updateOne({ _id: usersID }, { registrationStep });

    responseJSON.success = true;
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(`Error at controllers/user/postUpdateRegistrationStep: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postUpdateRegistrationStep;
