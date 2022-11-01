import mongoose from 'mongoose';
import Logger from 'bunyan';
import { config } from '@root/config';
import { redisConnection } from '@service/redis/redis.connection';

const log: Logger = config.createLogger('setupDatabase');

export default () => {
  const connect = async () => {
    mongoose
      .connect(`${config.DATABASE_URL}`)
      .then(() => {
        log.info('Successfully connected to DB');
        // REDIS CONNECTION
        redisConnection.connect();
      })
      .catch((error) => {
        log.error('Error connecting to DB', error);
        return process.exit(1);
      });
  };

  connect();
  mongoose.connection.on('disconnected', connect);
};
