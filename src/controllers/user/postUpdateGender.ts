import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Users } from "@models/users";
import { USERS_GENDER } from "@constants/user";

const postUpdateGender = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  try {
    const { gender } = req.body;
    const { usersID } = req;
console.log(gender)
    if (
      !gender ||
      typeof gender !== "string" ||
      !USERS_GENDER.includes(gender)
    ) {
      responseJSON.error = `Gender must be a string and on of ${USERS_GENDER.join()}`;
      responseJSON.errorCode = "INVALID_PARAMETER";
      return res.status(400).json(responseJSON);
    }

    await Users.updateOne({ _id: usersID }, { gender });

    responseJSON.success = true;
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(`Error at controllers/user/postUpdateGender: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postUpdateGender;
