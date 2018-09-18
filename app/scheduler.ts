import * as nodeSchedule from 'node-schedule';
import SlackAPI from './slack.service';
import { notificationMessage } from './data';

class Notifier {
    public job;
    private rule: string;
    private tzOffset = -18000;
    private message;
    
    public constructor(rule: string, message) {
        this.rule = rule;
        this.message = message;
    }

    public start() {
        this.job = nodeSchedule.scheduleJob(this.rule, this.notificationJob);
    }

    private notificationJob() {
        console.log("Notification Job: Started at " + new Date());

        SlackAPI.listUsers().then(users => {
            // @ts-ignore
            users.members.forEach(user => {
                // in Bogota/EST timezone
                if (user.tz_offset == this.tzOffset) {
                    this.sendNotification(user.id, user.name);
                }
            });
        }).catch(err => {
            console.log('Notification Job: Error Retrieving Users.' + err);
        });

        console.log("Notification Job: Completed at " + new Date());
    }

    private sendNotification(userId: string, userName: string) {
        this.message['callback_id'] = `bamboo_hours_${userId}`;
        this.message['channel_id'] = userId;
        SlackAPI.postMessage(this.message).then(res => {
            console.log(`Sent Timesheet Notification To ${userName}`);
        }).catch(err => {
            console.error(err);
        });
    }
};

export default Notifier;