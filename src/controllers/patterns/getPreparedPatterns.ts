import { logger } from "@logger/index";
import { Types } from "mongoose";
import { Response } from "express";
import { ExtendedRequest } from "@middlewares/checkAuth";
import { IResponseWithData } from "@controllers/controllers.interface";
import { OpenaiPatterns } from "@models/openai_patterns";
import { UsersOpenaiPatterns } from "@models/users_openai_patterns";
import dayjs from "dayjs";

const { ObjectId } = Types;

interface IGetPreparedPatternsResponse {
	openaiPatternsID: string;
	title: string;
	description: string;
	dateFrom: Date;
	dateTo: Date;
	periodType: string;
	measurementCodes: string[];
	usersNotificationsID: string;
	displayNames: string[];
	isNew: boolean;
	isRelevantToUser: boolean;
}

const getPreparedPatterns = async (req: ExtendedRequest, res: Response) => {
	const responseJSON: IResponseWithData<IGetPreparedPatternsResponse[] | []> = {
		success: false,
		error: "",
		errorCode: "",
		data: [],
	};
	try {
		const { usersID } = req;
		const [patternsConfigs, usersOpenaiPatterns] = await Promise.all([
			OpenaiPatterns.find({ active: true }).lean(),
			UsersOpenaiPatterns.aggregate([
				{
					$match: {
						usersID: new ObjectId(usersID),
						isShownToUser: true,
						isPatternFound: true,
					},
				},
				{
					$sort: {
						created: -1,
					},
				},
				{
					$group: {
						_id: "$openaiPatternsID",
						usersOpenaiPatternID: { $first: "$_id" },
						usersNotificationsID: { $first: "$usersNotificationsID" },
						created: { $first: "$created" },
						openaiPatternsID: { $first: "$openaiPatternsID" },
						title: { $first: "$title" },
						description: { $first: "$description" },
						isRelevantToUser: { $first: "$isRelevantToUser" },
					},
				},
				{
					$project: {
						_id: "$usersOpenaiPatternID",
						openaiPatternsID: true,
						usersNotificationsID: true,
						title: true,
						description: true,
						isRelevantToUser: true,
						dateTo: "$created",
					},
				},
			]),
		]);

		if (!patternsConfigs?.length) {
			logger.error("Patterns configs not found");
			throw new Error("Patterns not found");
		}

		if (!usersOpenaiPatterns?.length) {
			responseJSON.success = true;
			return res.status(200).json(responseJSON);
		}

		const preparedUsersPatterns = usersOpenaiPatterns
			.map((pattern) => {
				const patternConfig = patternsConfigs.find((config) => config._id.toString() === pattern.openaiPatternsID.toString());
				if (!patternConfig) {
					throw new Error(`Pattern config not found for pattern ${pattern.openaiPatternsID}`);
				}
				return {
					...pattern,
					dateFrom: dayjs(pattern.dateTo)
						.subtract(patternConfig?.compareIntervalValue, patternConfig?.compareIntervalType)
						.toDate(),
					isNew: dayjs(pattern.dateTo).add(1, "day").isAfter(dayjs()),
					measurementCodes: patternConfig.pair.map((measurementConfig) => measurementConfig.measurementCode),
					displayNames: patternConfig.pair.map((measurementConfig) => measurementConfig.displayName),
					periodType: patternConfig.compareIntervalType,
				};
			})
			.sort((a, b) => b.isNew - a.isNew);

		responseJSON.success = true;
		responseJSON.data = preparedUsersPatterns;
		return res.status(200).json(responseJSON);
	} catch (e) {
		logger.error(`Error in controllers/getPreparedPatterns: ${e}`);
		logger.error(e);
		responseJSON.error = "Internal server error";
		responseJSON.errorCode = "INTERNAL_SERVER_ERROR";
		return res.status(500).json(responseJSON);
	}
};

export default getPreparedPatterns;
