import { IAuthJob } from '@auth/interfaces/auth.interface';
import { BaseQueue } from '@service/queus/base.queue';
import { authWorker } from './../../workers/auth.worker';

class AuthQueue extends BaseQueue {
  constructor() {
    super('auth');
    // Using the worker instance
    // Method to process the job
    this.processJob('addAuthUserJobToDatabase', 5 , authWorker.addAuthUserToDB);
  }

  // Method to ADD the job to the queue
  public addAuthUserJob(name: string, data: IAuthJob): void {
    this.addJob(name, data);
  }
}

export const authQueue : AuthQueue = new AuthQueue();
