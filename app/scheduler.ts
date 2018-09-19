import * as nodeSchedule from 'node-schedule';
import SlackAPI from './slack.service';
import { notificationMessage, dateOptions } from './data';

class Notifier {
    public job;
    private rule: string;
    private static message;
    private static tzOffset: number = -18000;

    public constructor(rule: string, message: object) {
        this.rule = rule;
        Notifier.message = message;
    }

    public start() {
        this.job = nodeSchedule.scheduleJob(this.rule, this.notificationJob);
    }

    private notificationJob() {
        console.log("Notification Job: Started at " + new Date());

        // let message = notificationMessage;
        let offset = -18000;

        SlackAPI.listUsers().then((res) => {
            let users = res.data;

            users.members.forEach(user => {
                if (!user.is_bot && user.tz_offset === offset) {
                    // copy the notification messaget
                    let message = JSON.parse(JSON.stringify(notificationMessage));
                    message.attachments[0].callback_id = `bamboo_hours_${user.id}`;
                    message['channel'] = `${user.id}`;
                    message['text'] += (new Date()).toLocaleDateString('en-US', dateOptions);
                    console.log(message);
                    SlackAPI.postMessage(message).then(res => {
                        console.log(`Notification Job: Sent Timesheet Notification To ${user.name}`);
                    });
                }
            });
        }).catch(err => {
            console.error('Notification Job: ' + err);
        });

        console.log("Notification Job: Completed at " + new Date());
    }
};

export default Notifier;