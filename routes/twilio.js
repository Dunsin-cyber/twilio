var express = require("express");
var router = express.Router();
const AccessToken = require("twilio").jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
const env = require("dotenv").config();
const { accessToken, findOrCreateRoom } = require("../functions/Twilio");

// Used when generating any kind of tokens
// To set up environmental variables, see http://twil.io/secure
const twilioAccountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioApiKey = process.env.TWILIO_API_KEY;
const twilioApiSecret = process.env.TWILIO_API_SECRET;
const client = require("twilio")(twilioApiKey, twilioApiSecret, {
	accountSid: twilioAccountSid,
});

router.post("/room", async (req, res, next) => {
	try {
		const { room } = req.body;
		if (!room) {
			return res.status(400).json({ message: "No room name provided" });
		}
		// find or create a room with the given roomName
		findOrCreateRoom(room);
		// generate an Access Token for a participant in this room
		const token = await accessToken(room);
		res.status(201).json({
			token: token,
		});
	} catch (err) {
		throw new Error(err);
	}
});

/* POST users listing. */
router.post("/", async (req, res) => {
	const normalize = (name) => {
		return `${name.trim().toLowerCase().replace(/\s+/g, "-")}-${Math.floor(
			Math.random() * 10000
		)}`;
	};
	const identity = normalize("dave");
	console.log(identity);
	const ROOM = "Hi";

	try {
		// Fetch the room by name from the API.
		await client.video.rooms(ROOM).fetch();
	} catch (error) {
		// If the room can't be found, create a new room.
		try {
			await client.video.rooms.create({
				uniqueName: ROOM,
				type: "group",
			});
		} catch (error) {
			// If this fails, I'm not sure what went wrong!
			console.error(error);
		}
	}

	// Create Video Grant
	const videoGrant = new VideoGrant({
		room: "cool room",
	});

	// Create an access token which we will sign and return to the client,
	// containing the grant we just created
	const token = new AccessToken(
		twilioAccountSid,
		twilioApiKey,
		twilioApiSecret,
		{ identity: identity }
	);
	token.addGrant(videoGrant);

	// Serialize the token to a JWT string
	console.log(token.toJwt());

	res.json({
		token: token.toJwt(),
		identity,
		room: ROOM,
	});
});

module.exports = router;
