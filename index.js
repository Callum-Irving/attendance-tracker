const express = require('express');
const monk = require('monk');
const dotenv = require('dotenv');

const app = express();
const port = process.env.PORT || 5000;
const db = monk(process.env.MONGODB_URL);
const users = db.get('users');

app.use(express.static('client/dist'));

app.post('/login', (req, res) => {
	// Authenticate user
	// If user is authenticated, log attendance
});

app.listen(port, () => {
	console.log(`Listening on port ${port}`);
});
