import * as nodeSchedule from 'node-schedule';
import SlackAPI from './services/slack.service';
import { notificationMessage, getDateValues } from './utils/data';

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
        console.info("Notification Job: Started.");

        // let message = notificationMessage;
        let offset = -18000;

        SlackAPI.listUsers().then((res) => {
            let users = res.data;

            users.members.forEach(user => {
                if (!user.is_bot && user.tz_offset === offset) {
                    // copy the notification messaget
                    let message = JSON.parse(JSON.stringify(notificationMessage));
                    let timestamp = Date.now() / 1000;
                    message.attachments[0].callback_id = `bamboo_hours_${user.id}_${timestamp}`;
                    message['channel'] = `${user.id}`;
                    // add date to the text
                    let date = getDateValues();
                    message['text'] += `<!date^${date.timestamp}^{date_long}|${date.localString}>`;
                    SlackAPI.postMessage(message).then(res => {
                        console.info(`Notification Job: Sent Timesheet Notification To ${user.name}`);
                    });
                }
            });
        }).catch(err => {
            console.error('Notification Job: ' + err);
        });

        console.info("Notification Job: Completed.");
    }
};

export default Notifier;