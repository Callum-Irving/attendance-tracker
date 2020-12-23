const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const monk = require('monk');
const { google } = require('googleapis');
// const dotenv = require('dotenv');
// dotenv.config();

function createConnection() {
	return new google.auth.OAuth2(
		process.env.GOOGLE_CLIENT_ID,
		process.env.GOOGLE_CLIENT_SECRET,
		process.env.GOOGLE_REDIRECT_URL
	);
}
// const oauth = createConnection();
// Code to generate the google oauth2 url:
// const googleUrl = oauth.generateAuthUrl({
// scope: 'https://www.googleapis.com/auth/userinfo.email',
// });
// console.log(googleUrl);
// res.redirect(googleUrl);

const app = express();
const port = process.env.PORT || 5000;
const db = monk(process.env.MONGODB_URL);
const users = db.get('users');

let attendanceOpen = false;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static('client/dist'));

app.get('/login', (req, res) => {
	// Redirect to generated google url
	if (attendanceOpen) {
		res.redirect(process.env.GOOGLE_OAUTH_URL);
	} else {
		res.redirect('/?success=false');
	}
});

app.get('/oauthcallback', async (req, res) => {
	const code = req.query.code;
	if (code) {
		const OAuth2Client = createConnection();
		const { tokens } = await OAuth2Client.getToken(code);
		OAuth2Client.setCredentials(tokens);
		google
			.oauth2('v2')
			.userinfo.v2.me.get(
				{ auth: OAuth2Client },
				async (err, profile) => {
					if (err) {
						res.redirect('/?success=false');
					} else {
						if (!attendanceOpen) {
							res.redirect('/?success=false');
						} else {
							const userExists = await users.findOne({
								name: profile.data.name,
							});
							if (userExists) {
								// Log user
								users
									.update(userExists, {
										$set: { attended: true },
									})
									.then((success) => {
										res.redirect('/?success=true');
									})
									.catch((err) => {
										console.log(err);
										res.redirect('/?success=true');
									});
							} else {
								// Create user
								users
									.insert({
										name: profile.data.name,
										email: profile.data.email,
										attended: true,
									})
									.then((success) => {
										res.redirect('/?success=true');
									})
									.catch((err) => {
										console.log(err);
										res.redirect('/?success=true');
									});
							}
						}
					}
				}
			);
	} else {
		res.redirect('/?success=false');
	}
});

app.get('/*', (req, res) => {
	res.redirect('/');
});

app.post('/login', (req, res) => {
	if (req.body.password == process.env.ADMIN_PASSWORD) {
		res.json({
			success: true,
		});
	} else {
		res.json({
			success: false,
			errorMsg: 'Error: Incorrect password',
		});
	}
});

app.post('/api/getuserdata', async (req, res) => {
	if (req.body.password != process.env.ADMIN_PASSWORD) {
		res.json({
			success: false,
			errorMsg: 'Error: Incorrect password',
		});
	}
	// Get user data from database
	const allUsers = await users.find();
	res.json({
		success: true,
		attendanceOpen: attendanceOpen,
		userList: allUsers,
	});
});

app.post('/api/openattendance', (req, res) => {
	if (req.body.password != process.env.ADMIN_PASSWORD) {
		res.json({ success: false, errorMsg: 'Error: Incorrect password' });
	} else {
		attendanceOpen = !attendanceOpen;
		res.json({ success: true });
	}
});

app.post('/api/resetuserattendance', async (req, res) => {
	if (req.body.password != process.env.ADMIN_PASSWORD) {
		res.json({ success: false, errorMsg: 'Error: Incorrect password' });
	} else {
		const allUsers = await users.find();
		allUsers.forEach(async (user) => {
			users.update(user, { $set: { attended: false } });
		});
		res.json({ success: true });
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
