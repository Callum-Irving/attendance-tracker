const express = require('express');
const bodyParser = require('body-parser');
const monk = require('monk');
const { google } = require('googleapis');
const dotenv = require('dotenv');
dotenv.config();

let attendanceOpen = true;

function createConnection() {
	return new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.GOOGLE_REDIRECT_URL
	);
}

// Code to generate the google oauth2 url:
// const googleUrl = oauth2Client.generateAuthUrl({
// scope: 'https://www.googleapis.com/auth/userinfo.email',
// });

const app = express();
const port = process.env.PORT || 5000;
const db = monk(process.env.MONGODB_URL);
const users = db.get('users');

app.use(bodyParser.urlencoded({ extended: false }));

// Express middleware to detect if user has logged in with google
const googleLoginReader = async (req, res, next) => {
	const code = req.query.code;
	if (code) {
		const OAuth2Client = createConnection();
		const { tokens } = await OAuth2Client.getToken(code);
		OAuth2Client.setCredentials(tokens);
		google.oauth2('v2').userinfo.v2.me.get({ auth: OAuth2Client }, (err, profile) => {
			if (err) {
				console.log(err);
			} else {
				console.log(profile.data);
				// Log user in database
				// Each user will have 3 fields:
				// 1. User name
				// 2. User email
				// 3. Attended
				// The admin can set everybody's attended to false each new meeting
				// Admin can also close and open attendance
			}
		});
	}
	next();
};

app.use(googleLoginReader);
app.use(express.static('client/dist'));

app.get('/login', (req, res) => {
	// Redirect to generated google url
	res.redirect(process.env.GOOGLE_OAUTH_URL);
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
