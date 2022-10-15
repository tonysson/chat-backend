import express, { Express } from 'express';
import { ChattyServer } from './setupServer';
import dbConnection from './setupDatabase';
import { config } from '@root/config';

class Application {
  // Initialize express server
  public initialize(): void {
    this.loadConfig();
    dbConnection();
    const app: Express = express();
    const server: ChattyServer = new ChattyServer(app);
    server.start();
  }

  // Laod config
  private loadConfig(): void {
    config.validateConfig();
    config.cloudinaryConfig();

  }
}

const application: Application = new Application();

application.initialize();
