import validator from "validator";
import { logger } from "@logger/index";
import { Users } from "@models/users";
import { Request, Response } from "express";
import { IGoogleProfile, SocialType } from "@controllers/user/postGoogleSignin";
import { generateAuthToken } from "./generateAuthToken";

interface ISocialLoginReturn {
  accessToken: string;
  isNewUser: boolean;
  usersID: string;
  isEmailRequested: boolean;
}
const socialLogin = async (
  req: Request,
  res: Response,
  profile: IGoogleProfile,
  socialFieldName: SocialType,
): Promise<ISocialLoginReturn> => {
  const clientData = { userAgent: req.headers["user-agent"] };
  const isEmailValid = profile.email && validator.isEmail(profile.email);
  const profileEmail = isEmailValid ? `${profile.email}`.toLowerCase() : "";
  const profileId = `${profile.id}` || "";
  const profileName = profile.name || "";

  let usersEmail = profileEmail;
  // Get user from users using FB_ID
  const searchOption = {
    socialAccounts: { [socialFieldName]: profileId },
    active: true,
  };
  const userBySocialId = await Users.findOne(searchOption);
  // Opt: User exists
  if (userBySocialId) {
    usersEmail = userBySocialId.email;
    try {
      // User exists but doesn't have EMAIL, so update it
      if (!userBySocialId.email && profileEmail) {
        usersEmail = profileEmail;
        await Users.updateOne(searchOption, {
          email: profileEmail,
          lastUpdated: new Date(),
        });
      }
    } catch (e) {
      logger.error(`Can't set new email: ${e}`);
      logger.error(e);
    }

    const tokens = await generateAuthToken(
      socialFieldName,
      clientData,
      userBySocialId._id,
    );
    return {
      ...tokens,
      isNewUser: false,
      usersID: userBySocialId._id.toString(),
      isEmailRequested: !usersEmail,
    };
  }

  // Opt: User not exists, and we have FB_EMAIL
  if (profileEmail) {
    // Get user from users using FB_EMAIL
    const userByMail = await Users.findOne({
      email: profileEmail,
      active: true,
    });
    if (userByMail) {
      // const updateFields = {};

      // User exists but doesn't have FB_ID, so update it
      // updateFields.socialAccounts[socialFieldName] = profile.id;
      // updateFields.lastUpdated = new Date();
      // const updatedUser = await Users.updateOne({ _id: userByMail._id }, { $set: updateFields });
      await Users.updateOne(
        { _id: userByMail._id },
        {
          $set: {
            [`socialAccounts.${socialFieldName}`]: profile.id,
            lastUpdated: new Date(),
          },
        },
      );
      const tokens = await generateAuthToken(
        socialFieldName,
        clientData,
        userByMail._id,
      );
      return {
        ...tokens,
        isNewUser: false,
        usersID: userByMail._id.toString(),
        isEmailRequested: !usersEmail,
      };
    }
  }
  // Opt: User not exists, so creating new user
  const newUser = new Users({
    email: profileEmail,
    socialAccounts: {
      [socialFieldName]: profileId,
    },
    name: profileName,
    created: new Date(),
    lastUpdated: new Date(),
    active: true,
  });
  const savedNewUser = await newUser.save();
  // await rabbitMQClient.sendToQueue("user:init:nfts:event", {
  // 	userID: newUser._id.toString(),
  // });
  const tokens = await generateAuthToken(
    socialFieldName,
    clientData,
    newUser._id,
  );

  return {
    ...tokens,
    isNewUser: true,
    usersID: savedNewUser._id.toString(),
    isEmailRequested: !usersEmail,
  };
};

export { socialLogin };
