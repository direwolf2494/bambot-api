import axios, { AxiosInstance } from 'axios';
import { isNull } from 'util';
import * as crypto from 'crypto';
import * as uuid from 'uuid';

import redisClient from '../utils/redis';
import SlackAPI from './slack.service';
import { getDateValues, slackResponses, testData } from '../utils/data';
import { resolve } from 'url';

class BambooService {
    private instance: AxiosInstance;
    private states = Object.freeze({ 'success': 1, 'failure': 0, 'missing': -1, 'retry': 2 });
    
    public constructor(apiKey: string) {
        this.instance = axios.create({
            baseURL: 'https://api.bamboohr.com/api/gateway.php/qualityworksconsulting/v1',
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Accept': 'application/json'
            },
            auth: {
                username: apiKey,
                password: crypto.randomBytes(20).toString('hex')
            }
        });
        this.loadEmployees();
        console.log('We never stood a chance!');
    }

    public getEmployeeDirectory() {
        // return this.instance.get('/employees/directory');
        let res = { data: testData };
        return new Promise((resolve, reject) => {
            resolve(res);
        });
    }

    public updateHours(timetrackingData) {
        return this.fetchEmployee(timetrackingData.email).then(userId => {
            if (isNull(userId)) {
                this.loadEmployees().then(res => {
                    this.fetchEmployee(timetrackingData.email).then(userId => {
                        if (isNull(userId)) this.sendResponse( this.states.missing, timetrackingData);
                        else this.addTimetracking(userId, timetrackingData)
                    });
                }).catch(err => {
                    console.error(err);
                });
            } else {
                this.addTimetracking(userId, timetrackingData);
            }
        }).catch(err => {
            console.error(err);
        })
    }

    private addTimetracking(userId, userData) {
        let recordDate = new Date(userData.message_ts * 1000);
        let payload = {
            "timeTrackingId": uuid.v4(),
            "employeeId": userId,
            "dateHoursWorked": recordDate.toISOString(),
            "rateType": "REG",
            "hoursWorked": userData.hours,
        }

        this.instance.post('/timetracking/add', payload).then(res => {
            switch (res.status) {
                case 201: // success
                    this.sendResponse(this.states.success, userData);
                    break;
                case 503: // we're being rate limited
                    this.sendResponse(this.states.retry, userData);
                    break;
                default: // the request failed or there was no response
                    this.sendResponse(this.states.failure, userData);
            }
        }).catch(err => {
            this.sendResponse(this.states.retry, userData);
            console.error(err);
        });
    }
    
    private sendResponse(type: Number, data: any) {
        let payload = {
            channel: data.channel.id,
            ts: data.message_ts,
            attachments: []
        }

        if (type === this.states.retry) {
            payload['text'] = slackResponses.tryAgainLater;
            payload['channel'] = data.channel.ids
            SlackAPI.postMessage(payload).then(res => {
                console.info('Retry Message Response:' + res);
            });
            return;
        } else if (type === this.states.success) {
            let dateInfo = {
                hours: data.hours,
                timestamp: data.message_ts,
                localString: getDateValues(data.message_ts).localString
            }
            payload['text'] = slackResponses.timeTrackingUpdateSuccess(dateInfo);
        } else if (type == this.states.failure) {
            payload['text'] = slackResponses.timeTrackingUpdateFailed;
        } else if (type === this.states.missing) {
            payload['text'] = slackResponses.notInEmployeeDatabase;
        }

        SlackAPI.updateMessage(payload).then(this.updateHandler);
    } 

    private updateHandler(res) {
        if (res.data.ok) console.info('Message Updated Successfully.');
        else console.error('Update Failed: ' + res.data.error);
    }

    private loadEmployees(): Promise<any> {
        return this.getEmployeeDirectory().then(res => {
            // @ts-ignore
            let employees = res.data.employees;
            employees.forEach(employee => {
                if (!isNull(employee.workEmail)) {
                    // @ts-ignore
                    redisClient.setAsync(employee.workEmail, employee.id).then(res => {
                        console.log(`Adding ${employee.workEmail} to cache: ${res}`);
                    }).catch(err => {
                        console.error(err);
                    });
                }
            })
        }).catch(err => {
            console.log('ERROR:', err);
        });
    }

    private fetchEmployee(email: string): Promise<any> {
        // @ts-ignore
        return redisClient.getAsync(email);
    }
}

let BambooAPI = new BambooService(process.env.BAMBOO_TOKEN);
export default BambooAPI;