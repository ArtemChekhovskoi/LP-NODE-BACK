import config from "@config/index";
import { IGoogleProfile } from "@controllers/user/postGoogleSignin";

const getDataFromGoogle = async (accessToken: string): Promise<IGoogleProfile> => {
	const googleAuth = {
		Authorization: `Bearer ${accessToken}`,
	};
	const GOOGLE_URL = config.auth.google.url;
	const data = await fetch(GOOGLE_URL, {
		headers: googleAuth,
	});
	const jsonProfile = await data.json();
	return jsonProfile;
};

export { getDataFromGoogle };
