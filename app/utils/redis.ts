import * as bluebird from 'bluebird';
import * as redis from 'redis';

let redisAsync = bluebird.promisifyAll(redis);
let redisClient = redisAsync.createClient({
    url: process.env.REDIS_URL,
    password: process.env.REDIS_PASSWORD
});
export default redisClient;