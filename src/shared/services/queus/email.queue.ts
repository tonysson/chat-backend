import { BaseQueue } from '@service/queus/base.queue';
import { IEmailJob } from '@user/interfaces/user.interface';
import { emailWorker } from './../../workers/email.worker';

class EmailQueue extends BaseQueue {
  constructor() {
    super('emails queue');
    this.processJob('forgotPasswordEmail', 5, emailWorker.addNotificationEmail);
    
  }

  public addEmailJob(name: string, data: IEmailJob) {
    this.addJob(name, data);
  }
}

export const emailQueue: EmailQueue = new EmailQueue();
