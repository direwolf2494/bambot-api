import * as bluebird from 'bluebird';
import * as redis from 'redis';

let redisAsync = bluebird.promisifyAll(redis);
let redisClient = redisAsync.createClient();
export default redisClient;