import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Users } from "@models/users";

const getProfile = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
    data: {},
  };
  try {
    const { usersID } = req;

    const userProfile = await Users.findOne(
      { _id: usersID },
      {
        name: true,
        email: true,
        registrationStep: true,
        appsConnected: true,
        lastSyncDate: true,
      },
    );
    if (!userProfile) {
      responseJSON.error = "Missing user!";
      responseJSON.errorCode = "MISSING_USER";
      return res.status(400).json(responseJSON);
    }

    responseJSON.data = userProfile;
    responseJSON.success = true;
    return res.json(responseJSON);
  } catch (e) {
    logger.error(`Error at getProfile: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default getProfile;
