import Logger from 'bunyan';
import { config } from '@root/config';
import { BaseCache } from './base.cache';

const log: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
  constructor() {
    // allow our redisConnection class to have access to the constructor of BaseCache
    super('redisConnection');
  }

  async connect(): Promise<void> {
    try {
      // this.client comes from our BaseCache
      // Redis connection
      await this.client.connect();
      // const res = await this.client.ping();
      // console.log(res );
    } catch (error) {
      log.error(error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
