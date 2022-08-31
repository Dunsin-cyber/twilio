const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const env = require("dotenv").config();
const { v4: uuidv4 } = require("uuid");
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;
const client = require("twilio")(twilioApiKey, twilioApiSecret, {
	accountSid: twilioAccountSid,
});

const findOrCreateRoom = async (room) => {
	try {
		//check if room exist
		await client.video.rooms(room).fetch();
	} catch (err) {
		if (err.code == 20404) {
			await twilio.video.rooms.create({
				uniqueName: room,
				type: "go",
			});
		}
		// throw new Error(err);
	}
};

const accessToken = async (roomName) => {
	try {
		// create an access token
		const token = new AccessToken(
			process.env.TWILIO_ACCOUNT_SID,
			process.env.TWILIO_API_KEY,
			process.env.TWILIO_API_SECRET,
			// generate a random unique identity for this participant
			{ identity: uuidv4() }
		);
		// create a video grant for this specific room
		const videoGrant = new VideoGrant({
			room: roomName,
		});

		// add the video grant
		token.addGrant(videoGrant);
		// serialize the token and return it
		return token.toJwt();
	} catch (err) {
		throw new Error(err);
	}
};

module.exports = {
	findOrCreateRoom,
	accessToken,
};
