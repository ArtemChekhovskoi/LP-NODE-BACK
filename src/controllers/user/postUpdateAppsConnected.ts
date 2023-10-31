import { Response } from "express";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { Users } from "@models/users";
import { APPS_CONNECTED } from "@constants/user";

const postUpdateAppsConnected = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  try {
    const { appsConnected } = req.body;
    const { usersID } = req;
    const validateAppsConnectedArray = (appsArray: string[]): boolean => {
      return appsArray.every((app) => {
        return APPS_CONNECTED.includes(app);
      });
    };
    if (!validateAppsConnectedArray(appsConnected)) {
      responseJSON.error = `Apps connected must be an array of strings and one of ${APPS_CONNECTED}`;
      responseJSON.errorCode = "INVALID_PARAMETER";
      return res.status(400).json(responseJSON);
    }

    await Users.updateOne(
      { _id: usersID },
      {
        $push: {
          appsConnected,
        },
      },
    );

    responseJSON.success = true;
    return res.status(200).json(responseJSON);
  } catch (e) {
    logger.error(`Error at controllers/user/postUpdateAppsConnected: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postUpdateAppsConnected;
