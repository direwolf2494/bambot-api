import axios from 'axios';
import SlackAPI from './slack.service';

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
            payload['text'] = `${data.hours} Hours Added Successfully :smiley:`;
            SlackAPI.updateMessage(payload).then(res => console.log(res.data));
        }).catch(err => {
            payload['text'] = 'Unable to Add Hours. Visit BambooHR and update manually. :disappointed:';
            SlackAPI.updateMessage(payload).then(res => console.log(res.data));
        });
    }
}

let BambooAPI = new BambooService(process.env.BAMBOO_TOKEN);
export default BambooAPI;