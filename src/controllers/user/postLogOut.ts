import { Response } from "express";
import { Sessions } from "@models/sessions";
import { logger } from "@logger/index";
import { ExtendedRequest } from "@middlewares/checkAuth";

const postLogOut = async (req: ExtendedRequest, res: Response) => {
  const responseJSON = {
    success: false,
    error: "",
    errorCode: "",
  };
  try {
    const { sessionsID } = req;
    if (!sessionsID) {
      responseJSON.error = "Missing sessionsID!";
      responseJSON.errorCode = "MISSING_SESSION_ID";
      return res.status(400).json(responseJSON);
    }

    const sessionToDisable = await Sessions.findOne({
      _id: req.sessionsID,
      active: true,
    });

    if (!sessionToDisable) {
      responseJSON.error = "Missing session!";
      responseJSON.errorCode = "MISSING_SESSION";
      return res.status(400).json(responseJSON);
    }

    await Sessions.updateOne({ _id: sessionToDisable._id }, { active: false });

    responseJSON.success = true;
    return res.json(responseJSON);
  } catch (e) {
    logger.error(`Error at postLogOut: ${e}`);
    responseJSON.error = "Something went wrong";
    responseJSON.errorCode = "SOMETHING_WRONG";
    return res.status(500).json(responseJSON);
  }
};

export default postLogOut;
