import axios, { AxiosPromise, AxiosInstance } from 'axios';

class SlackService {
    private instance: AxiosInstance; 

    public constructor(token: String) {
        this.instance = axios.create({
            baseURL: 'https://slack.com/api',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Bearer ${token}`
            }
        });
    }
    
    public postMessage(message): AxiosPromise {
        return this.instance.post('/chat.postMessage', message);
    }

    public openDialog(dialog): AxiosPromise {
        return this.instance.post('/dialog.open', dialog);
    }

    public listUsers() {
        return this.instance.post('/users.list', {limit: 200});
    }

    public sendReponse(responseUrl: string, data: object) {
        return this.instance.post(responseUrl, data);
    }
}

let SlackAPI = new SlackService(process.env.BOT_TOKEN);
export default SlackAPI;