// import * as express from 'express';
// import * as config from 'config';
// import * as bodyParser from 'body-parser';
// import axios from 'axios';

// const app = express();
// // configure body-parser
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
// // set axios token
// axios.defaults.headers.post['Authorization'] = `Bearer ${process.env.BOT_TOKEN}`
// // default slackbot endpoint
// app.post('/api/v1/slackbot', (req, res) => {
//   let payload = req.body;
//   let response_text = undefined;

//   if (payload.event.type === "app_mention") {

//     if (payload.event.text.includes("tell me a joke")) {
//       response_text = `Hello <@${payload.event.user}>! Knock, knock.`;
//     }
//   }

//   if (payload.event.type === "message") {
//     if (payload.event.text.includes("Who's there?")) {
//         response_text = "A bot user";
//     }

//     if (payload.event.text.includes("Bot user who?")) {
//         response_text = "No, I'm a bot user. I don't understand jokes.";
//     }
//   }

//   if (response_text !== undefined) {
//     axios.post('https://slack.com/api/chat.postMessage', {
//       text: response_text,
//       channel: payload.event.channel
//     }).then(res => {
//       console.log(res);
//     }).catch((err => {
//       console.error(err);
//     }));
    
//   }

//   res.sendStatus(200);
// });

// app.post('/api/v2/slackbot', (req, res) => {
//   let payload = req.body;
//   res.sendStatus(200);

//   if (payload.event.type === "message") {
//       let response_text;
//       if (payload.event.text.includes("<@UBJTTTDRT>") && payload.event.text.includes("tell me a joke")) {
//           response_text = `Hello <@${payload.event.username}>! Knock, knock.`
//       }
//       if (payload.event.text.includes("Who's there?")) {
//           response_text = "A bot user";
//       }
//       if (payload.event.text.includes("Bot user who?")) {
//           response_text = "No, I'm a bot user. I don't understand jokes.";
//       }
//       if (response_text !== undefined) {
//           // Make call to chat.postMessage sending response_text using bot's token
//       }
//   }
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`server running on port ${PORT}`)
// });

//30 16 * * 1-5