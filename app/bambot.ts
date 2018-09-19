import * as express from 'express';
import * as config from 'config';
import * as bodyParser from 'body-parser';
import * as crypto from 'crypto';
import axios from 'axios';

import Notifier from './scheduler';
import BambooAPI from './bamboo.service';
import SlackAPI from './slack.service';
import { notificationMessage, dialog } from './data';

// setup scheduled messages
const scheduler = new Notifier(String(config.get('schedule')), notificationMessage);
scheduler.start();

const app = express();
// verify that request came from slack
app.use((req, res, next) => {
	let maxTimeDiff = 60 * 5;
	let reqTimestamp = parseInt(req.get('X-Slack-Request-Timestamp'));
	let slackSignature = req.get('X-Slack-Signature');
	// verify that request headers were sent
	if (reqTimestamp == undefined || slackSignature == undefined) next('error');
	// verify that request was sent recently
	let currentTimestamp = (new Date()).getTime() / 1000;
	if ( (currentTimestamp - reqTimestamp) > maxTimeDiff) next('error');
	// create base64 verification string
	let sigBasestring = `v0:${reqTimestamp}:${req.body}`;
	let mySignature = 'v0=' + crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
		.update(sigBasestring)
		.digest('hex');
	// compare the signature string
	if (mySignature !== slackSignature) next('error');
	// verification passed
	next();
});

// configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// set slack api bot token
axios.defaults.headers.post['Authorization'] = `Bearer ${process.env.BOT_TOKEN}`

// default slackbot endpoint
app.post('/api/v1/bambot', (req, res) => {
	let payload = typeof(req.body.payload) === 'string' ? JSON.parse(req.body.payload) : req.body.payload;
	console.log(payload);

	if (payload.type == 'interactive_message') {
		let actions = payload.actions;
		if (actions != undefined && actions.length > 0) {
			// click 8 hours
			if (actions[0].value === 'default') {
				res.send();
				payload['hours'] = 8;
				BambooAPI.updateHours(payload);
			} else if (actions[0].value == 'custom') { // user clicked More Info
				let userDialog = JSON.parse(JSON.stringify(dialog));
				userDialog.dialog.callback_id = `${payload.callback_id}_dialog`;
				userDialog.dialog.state = payload.message_ts; // use to keep track of message_ts to update message later
				userDialog['trigger_id'] = payload.trigger_id;
				SlackAPI.openDialog(userDialog).then(res => console.log(res.data));
			}
		}
	} else if (payload.type == 'dialog_submission') { // user submitted the dialog
		let hours = Number.parseFloat(payload.submission.hours);

		if (isNaN(hours) || hours < 0 || hours > 24) {
			let message = isNaN(hours) ? "Hours should be a Number." : "Hours should be in range 0 - 24.";
			let errors = { errors: [{ name: "hours", error: message }]};
			res.status(200).send(errors);
		} else {
			res.send();
			payload['hours'] = hours;
			payload['message_ts'] = payload.state;
			BambooAPI.updateHours(payload);
		}
	}
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});