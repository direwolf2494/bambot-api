import axios from 'axios';
import SlackAPI from './slack.service';
import { dateOptions } from './data';

class BambooService {
    private instance;

    public constructor(apiKey: string) {
        this.instance = axios.create({
            baseURL: 'https://jsonplaceholder.typicode.com',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${apiKey}`
            }
        });
    }

    public updateHours(data) {
        let payload = {
            channel: data.channel.id,
            ts: data.message_ts
        }

        return this.instance.post('/posts', data).then(res => {
            let today = (new Date()).toLocaleDateString('en-US', dateOptions);
            payload['text'] = `:smiley: Great! I've added ${data.hours} hours to your timesheet for ${today}.`;
            SlackAPI.updateMessage(payload).then(res => console.log(res.data));
        }).catch(err => {
            payload['text'] = ':disappointed: Sigh. I was unable to update your timesheet. Visit BambooHR and update manually.';
            SlackAPI.updateMessage(payload).then(res => console.log(res.data));
        });
    }
}

let BambooAPI = new BambooService(process.env.BAMBOO_TOKEN);
export default BambooAPI;