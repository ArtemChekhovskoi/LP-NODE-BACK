import { Request, Response, NextFunction } from "express";
import config from "@config/index";
import jwt from "jsonwebtoken";
import { logger } from "@logger/index";
import { Users } from "@models/users";
import { Sessions } from "@models/sessions";
import validator from "validator";
import { Types } from "mongoose";
import * as process from "process";

const { ObjectId } = Types;

interface JWTData extends jwt.JwtPayload {
	sessionID?: string;
}

export interface ExtendedRequest extends Request {
	sessionsID?: string;
	usersID?: string;
	token?: string;
	bodySize?: number;
}
const checkAuth = async (req: ExtendedRequest, res: Response, next: NextFunction): Promise<void | Response> => {
	const isNotProtectedRoute = config.auth.notProtectedRoutes.find((route) => req.url.startsWith(route));
	if (isNotProtectedRoute) {
		return next();
	}
	try {
		if (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer") {
			const token = req.headers.authorization.split(" ")[1];
			const jwtData: JWTData | string = jwt.verify(token, process.env.JWT_SECRET || "secret");
			if (typeof jwtData === "string") {
				throw new Error(`Jwt data is incorrect ${jwtData}`);
			}
			if (!jwtData.sessionID) {
				throw new Error(`SessionID in token is missing ${token}`);
			}
			const isSessionIDValid = jwtData && typeof jwtData.sessionID === "string" && validator.isMongoId(jwtData.sessionID);

			if (!isSessionIDValid) {
				throw new Error(`SessionID in token is invalid ${token}`);
			}

			const sessionsID = new ObjectId(jwtData.sessionID);
			const session = await Sessions.findOne({
				_id: sessionsID,
				active: true,
			});

			if (!session) {
				throw new Error(`Session not found - token: ${token}`);
			}

			const { usersID } = session;

			if (!usersID) {
				throw new Error(`Not found usersID - in session ${session._id}, token: ${token}`);
			}

			const user = await Users.findOne(
				{ _id: usersID, active: true },
				{
					_id: true,
				}
			);

			if (!user) {
				throw new Error(`User not found - by session ${session._id}, usersID: ${usersID}, token: ${token}`);
			}

			req.usersID = user._id.toString();
			req.sessionsID = sessionsID.toString();
			req.token = token;
			return next();
		}
		throw new Error("No auth token provided");
	} catch (e: any) {
		logger.error(`Error in middleware/checkAuth: ${e}`);
		logger.error(e);
		return res.status(401).json({
			success: false,
			error: "Error: Not authorized to access this resource",
			errorCode: "NOT_AUTHORIZED",
		});
	}
};

export { checkAuth };
