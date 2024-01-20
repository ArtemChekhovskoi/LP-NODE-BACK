import { Users } from "@models/users";
import { Request, Response } from "express";
import { IGoogleProfile, SocialType } from "@controllers/user/postGoogleSignin";
import createSha512Hash from "@helpers/createSha512Hash";
import { generateAuthToken } from "./generateAuthToken";

interface ISocialLoginReturn {
  accessToken: string;
  usersID: string;
  registrationStep?: string;
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
  const hashedProfileId = createSha512Hash(`${profile.id}`) || "";

  const searchOption = {
    socialAccounts: { [socialFieldName]: hashedProfileId },
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
    };
  }

  // Opt: User not exists, so creating new user
  const newUser = new Users({
    socialAccounts: {
      [socialFieldName]: hashedProfileId,
    },
    created: new Date(),
    lastUpdated: new Date(),
    active: true,
    registrationStep: "gender",
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
  };
};

export { socialLogin };
