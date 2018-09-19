import axios from 'axios';
import SlackAPI from './slack.service';
import { getDateValues } from './data';

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
            ts: data.message_ts,
            attachments: []
        }

        return this.instance.post('/posts', data).then(res => {
            let date = getDateValues();
            payload['text'] = `:smiley: Great! I've added ${data.hours} hours to your timesheet for ` + 
                `<!date^${date.timestamp}^{date_long}|${date.localString}>.`;
            SlackAPI.updateMessage(payload).then(this.updateHandler);
        }).catch(err => {
            payload['text'] = ':disappointed: Sigh. I was unable to update your timesheet. Visit BambooHR and update manually.';
            SlackAPI.updateMessage(payload).then(this.updateHandler);
        });
    }

    private updateHandler(res) {
        if (res.data.ok) console.log('Message Updated Successfully.');
        else console.error('Update Failed: ' + res.data.error);
    }
}

let BambooAPI = new BambooService(process.env.BAMBOO_TOKEN);
export default BambooAPI;