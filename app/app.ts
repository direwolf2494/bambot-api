import * as express from 'express';
import * as config from 'config';
import * as bodyParser from 'body-parser';

const app = express();
// configure body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// default slackbot endpoint
app.post('/api/v1/slackbot', (req, res) => {
  res.status(200).send({
    challenge: req.body.challenge
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});