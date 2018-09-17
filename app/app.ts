import * as express from 'express';
import * as config from 'config';
import * as bodyParser from 'body-parser';
import axios from 'axios';

const app = express();
// configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
let TOKEN = process.env.BOT_TOKEN;

// default slackbot endpoint
app.post('/api/v1/slackbot', (req, res) => {
  let payload = req.body;
  res.sendStatus(200);

  if (payload.event.type === "app_mention") {
    if (payload.event.text.includes("tell me a joke")) {
        axios.post('https://slack.com/api/chat.postMessage', {
          token: TOKEN,
          text: `Hello ${payload.event.user}! Knock, knock.`,
          channel: payload.event.item.channel
        });
    }
}
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});