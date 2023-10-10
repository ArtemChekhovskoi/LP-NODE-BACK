import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Users } from "@models/users";

const postUpdateLocation = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  try {
    const { location } = req.body;
    const { usersID } = req;

    if (!location || typeof location !== "string") {
      responseJSON.error = "Location must be a string";
      responseJSON.errorCode = "INVALID_PARAMETER";
      return res.status(400).json(responseJSON);
    }

    await Users.updateOne({ _id: usersID }, { location });

    responseJSON.success = true;
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(`Error at controllers/user/postUpdateLocation: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postUpdateLocation;
