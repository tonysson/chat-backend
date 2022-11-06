import { Request, Response } from 'express';
import * as cloudinary from '@global/helpers/cloudinary-upload';
import {
  authMock,
  authMockRequest,
  authMockResponse,
} from '@root/mocks/auth.mock';
import { SignUp } from './../signup';
import { CustomError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { UserCache } from '@service/redis/user.cache';

jest.useFakeTimers();
jest.mock('@service/queus/base.queue');
jest.mock('@service/redis/user.cache');
jest.mock('@service/queus/user.queue');
jest.mock('@service/queus/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');

describe('Signup', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });
  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  it('Should throw an error if username is not exist', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'soloange@gmail.com',
        password: 'solange',
        avatarColor: 'red',
        avatarImage:
          'https://res.cloudinary.com/dnhrwlehq/image/upload/v1667281731/6360b343a7d6e2be75912bc5.jpg',
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        'Username is a required field'
      );
    });
  });

  it('Should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ta',
        email: 'soloange@gmail.com',
        password: 'solange',
        avatarColor: 'red',
        avatarImage:
          'https://res.cloudinary.com/dnhrwlehq/image/upload/v1667281731/6360b343a7d6e2be75912bc5.jpg',
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('Should throw an error if username length is greather than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'tatatatatatatata',
        email: 'soloange@gmail.com',
        password: 'solange',
        avatarColor: 'red',
        avatarImage:
          'https://res.cloudinary.com/dnhrwlehq/image/upload/v1667281731/6360b343a7d6e2be75912bc5.jpg',
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('Should throw an error if email is not provided', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'solange',
        email: '',
        password: 'solange',
        avatarColor: 'red',
        avatarImage:
          'https://res.cloudinary.com/dnhrwlehq/image/upload/v1667281731/6360b343a7d6e2be75912bc5.jpg',
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual(
        'Email is a required field'
      );
    });
  });
  it('Should throw an error if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'solange',
        email: 'no valid email',
        password: 'solange',
        avatarColor: 'red',
        avatarImage:
          'https://res.cloudinary.com/dnhrwlehq/image/upload/v1667281731/6360b343a7d6e2be75912bc5.jpg',
      }
    ) as Request;
    const res: Response = authMockResponse();
    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('Should throw unauthorized error if user already exists', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'solange',
        email: 'solange@gmail.com',
        password: 'solange',
        avatarColor: 'red',
        avatarImage:
          'https://res.cloudinary.com/dnhrwlehq/image/upload/v1667281731/6360b343a7d6e2be75912bc5.jpg',
      }
    ) as Request;
    const res: Response = authMockResponse();

    jest
      .spyOn(authService, 'getUserByUsernameOrEmail')
      .mockResolvedValue(authMock);

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('Should set session data for valid credentials and send corresct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'testing',
        email: 'test@gmail.com',
        password: 'testing',
        avatarColor: 'yellow',
        avatarImage:
          'https://res.cloudinary.com/dnhrwlehq/image/upload/v1667281731/6360b343a7d6e2be75912bc5.jpg',
      }
    ) as Request;
    const res: Response = authMockResponse();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    jest
      .spyOn(authService, 'getUserByUsernameOrEmail')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest
      .spyOn(cloudinary, 'uploads')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .mockImplementation((): any =>
        Promise.resolve({ version: '1238333eeee', public_id: '2223333' })
      );

    await SignUp.prototype.create(req, res);
    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2],
      token: req.session?.jwt,
    });
  });
});
