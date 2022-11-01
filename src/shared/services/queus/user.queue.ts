import { BaseQueue } from '@service/queus/base.queue';
import { userhWorker } from './../../workers/user.worker';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    // Using the worker instance
    // Method to process the job
    this.processJob('addUserJobToDatabase', 5, userhWorker.addUserToDB);
  }

  // Method to ADD the job to the queue
  public addUserJob(name: string, data: any): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
