import validator from "validator";
import { Users } from "@models/users";
import { Request, Response } from "express";
import { IGoogleProfile, SocialType } from "@controllers/user/postGoogleSignin";
import { generateAuthToken } from "./generateAuthToken";

interface ISocialLoginReturn {
  accessToken: string;
  usersID: string;
  registrationStep?: string;
  name: string;
  email: string;
  appsConnected: string[] | [];
  lastSyncDate: Date;
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

  const searchOption = {
    socialAccounts: { [socialFieldName]: profileId },
    active: true,
  };
  const userBySocialId = await Users.findOne(searchOption);
  if (userBySocialId) {
    const tokens = await generateAuthToken(
      socialFieldName,
      clientData,
      userBySocialId._id,
    );
    return {
      ...tokens,
      usersID: userBySocialId._id.toString(),
      registrationStep: userBySocialId.registrationStep,
      appsConnected: userBySocialId.appsConnected,
      lastSyncDate: userBySocialId.lastSyncDate || new Date(),
      name: userBySocialId.name,
      email: userBySocialId.email,
    };
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
    registrationStep: "new",
    lastSyncDate: new Date(),
  });
  const savedNewUser = await newUser.save();

  const tokens = await generateAuthToken(
    socialFieldName,
    clientData,
    newUser._id,
  );

  return {
    ...tokens,
    usersID: savedNewUser._id.toString(),
    registrationStep: savedNewUser.registrationStep,
    lastSyncDate: savedNewUser.lastSyncDate || new Date(),
    appsConnected: [],
    name: savedNewUser.name,
    email: savedNewUser.email,
  };
};

export { socialLogin };
