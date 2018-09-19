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
        return this.instance.post('/posts', data).then(res => {
            let text = '8 Hours Added Successfully. :smiley:';
            SlackAPI.sendReponse(data.response_url, {text: text}).then(res => console.log(res.data)); // add then/catch
        }).catch(err => {
            let text = 'Unable to Add Hours. Visit BambooHR and update manually. :disappointed:';
            SlackAPI.sendReponse(data.response_url, {text: text}).then(res => console.log(res.data)); // add then/catch
        });
    }
}

let BambooAPI = new BambooService(process.env.BAMBOO_TOKEN);
export default BambooAPI;