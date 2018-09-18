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
// app.use((req, res, next) => {
// 	let maxTimeDiff = 60 * 5;
// 	let reqTimestamp = parseInt(req.get('X-Slack-Request-Timestamp'));
// 	let slackSignature = req.get('X-Slack-Signature');
// 	// verify that request headers were sent
// 	if (reqTimestamp == undefined || slackSignature == undefined) next('error');
// 	// verify that request was sent recently
// 	let currentTimestamp = (new Date()).getTime() / 1000;
// 	if ( (currentTimestamp - reqTimestamp) > maxTimeDiff) next('error');
// 	// create base64 verification string
// 	let sigBasestring = `v0:${reqTimestamp}:${req.body}`;
// 	let mySignature = 'v0=' + crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
// 		.update(sigBasestring)
// 		.digest('hex');
// 	// compare the signature string
// 	if (mySignature !== slackSignature) next('error');
// 	// verification passed
// 	next();
// });

// configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// set slack api bot token
axios.defaults.headers.post['Authorization'] = `Bearer ${process.env.BOT_TOKEN}`

// default slackbot endpoint
app.post('/api/v1/bambot', (req, res) => {
	let payload = req.body;

	if (payload.type == 'interactive_message') {
		let actions = payload.actions;
		if (actions != undefined && actions.length > 0) {
			// click 8 hours
			if (actions[0].value === 'default') {
				res.sendStatus(200);
				BambooAPI.updateHours(payload);
			} else if (actions[0].value == 'custom') { // user clicked More Info
				dialog['callback_id'] = payload.callback_id;
				dialog['trigger_id'] = payload.trigger_id;
				SlackAPI.openDialog(dialog);
			}
		}
  	} else if (payload.type == 'dialog_submission') { // user submitted the dialog
		if (parseInt(payload.submission.hours) <= 0) {
			let errors = { errors: [{ name: "hours", error: "Hours should be greater than 0." }]};
			res.status(200).send(errors);
		} else {
			res.sendStatus(200);
			BambooAPI.updateHours(payload);
		}
	}
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});