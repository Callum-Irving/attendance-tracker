const path = require('path');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

let attendanceOpen = false;

// Start connection with Mongoose
mongoose.connect(process.env.MONGODB_URL, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

// User model for storing user information in MongoDB database
const user = mongoose.model('user', {
	name: String,
	email: String,
	attended: Boolean,
});

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static('client/dist'));

// Passport js configuration for logging in with google
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done) {
	done(null, user);
});
passport.deserializeUser(function (user, done) {
	done(null, user);
});

passport.use(
	new GoogleStrategy(
		{
			clientID: process.env.GOOGLE_CLIENT_ID,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET,
			callbackURL: process.env.GOOGLE_REDIRECT_URL,
		},
		function (accessToken, refreshToken, profile, done) {
			let userProfile = profile;
			return done(null, userProfile);
		}
	)
);

app.get('/login', passport.authenticate('google', { scope: 'email' }));

app.get(
	'/api/verifyoauth',
	passport.authenticate('google'),
	async (req, res) => {
		if (!attendanceOpen) {
			return res.json({
				success: false,
				errorMsg: 'Attendance is not open.',
			});
		}
		const userProfile = req.user._json;
		const existingUser = await user.findOne({
			name: userProfile.name,
		});
		if (existingUser) {
			if (existingUser.attended === true) {
				return res.json({
					success: false,
					errorMsg: 'You have already been logged.',
				});
			}
			// Log user
			await user.updateOne(existingUser, {
				attended: true,
			});
			return res.json({ success: true });
		} else {
			// Create user
			const newUser = new user({
				name: userProfile.name,
				email: userProfile.email,
				attended: true,
			});
			newUser.save((err, success) => {
				if (err) {
					console.error(err);
					return res.json({
						success: false,
						errorMsg: 'Error saving new user to database.',
					});
				}
				return res.json({ success: true });
			});
		}
	}
);

// Redirect everything to '/' to work with vue router
app.get('/*', (req, res) => {
	res.redirect('/');
});

app.post('/login', (req, res) => {
	if (req.body.password === process.env.ADMIN_PASSWORD) {
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
	const allUsers = await user.find();
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
		const allUsers = await user.find();
		allUsers.forEach(async (userProfile) => {
			await user.updateOne(userProfile, { attended: false });
		});
		res.json({ success: true });
	}
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
