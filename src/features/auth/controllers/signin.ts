import { Request, Response } from 'express';
import JWT from 'jsonwebtoken';
import HTTP_STATUS from 'http-status-codes';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import { loginSchema } from '@auth/schemes/signin';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { userService } from '@service/db/user.service';
import {IUserDocument} from '@user/interfaces/user.interface';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByUsername(
      username
    );
    if (!existingUser) {
      throw new BadRequestError('No user found');
    }

    const isPasswordsMatch: boolean = await existingUser.comparePassword(
      password
    );
    if (!isPasswordsMatch) {
      throw new BadRequestError('Invalid credentials');
    }
    const user: IUserDocument = await userService.getUserByAuthId(
      `${existingUser._id}`
    );
    const userJwt: string = JWT.sign(
      {
        userId: user?._id,
        uId: existingUser?.uId,
        email: existingUser?.email,
        username: existingUser?.username,
        avatarColor: existingUser?.avatarColor,
      },
      config.JWT_TOKEN!
    );
    req.session = { jwt: userJwt };
    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt,
    } as IUserDocument;

    // SEND MAIL TESTING
    // await mailTransport.sendEmail('arnaldo41@ethereal.email' , 'Testing email' , 'This is a test email to check our function... Happy coding!!!! ');
    // const templateParams: IResetPasswordParams = {
    //   username: existingUser!.username,
    //   email: existingUser!.email,
    //   ipaddress: publicIp.address(),
    //   date: moment().format('DD/MM/YYYY HH:mm'),
    // };
    // const resetLink = `${config.CLIENT_URL}/reset-password?token=12444455`;
    // const template: string =
    //   resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);
    // emailQueue.addEmailJob('forgotPasswordEmail', {
    //   receiverEmail: 'lynn.toy94@ethereal.email',
    //   subject: 'Password reset confirmation',
    //   template,
    // });

    res.status(HTTP_STATUS.OK).json({
      message: 'User login successfully',
      user: userDocument,
      token: userJwt,
    });
  }
}
