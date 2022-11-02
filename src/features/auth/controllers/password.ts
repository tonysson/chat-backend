import { Request, Response } from 'express';
import { config } from '@root/config';
import HTTP_STATUS from 'http-status-codes';
import moment from 'moment';
import publicIP from 'ip';
import { joiValidation } from '@global/decorators/joi-validation.decorator';
import { emailSchema, passwordSchema } from '@auth/schemes/password';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { authService } from '@service/db/auth.service';
import { BadRequestError } from '@global/helpers/error-handler';
import crypto from 'crypto';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queus/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { resetPasswordTemplate } from './../../../shared/services/emails/templates/reset-password/reset-password-template';

export class Password {
  /**
   *@description : Send Reset link email to change the password.
   * @param req
   * @param res
   */
  @joiValidation(emailSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { email } = req.body;
    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(
      email
    );
    if (!existingUser) {
      throw new BadRequestError('Invalid credentials : email');
    }

    // CREATE RANDOM CHARACTER
    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharcters = randomBytes.toString('hex');

    // UPDATE OUR AUTH DOCUMENT
    // reset password is valide for 1h
    const tokenValidationTime = Date.now() * 60 * 60 * 1000;
    await authService.updatePasswordToken(
      `${existingUser._id!}`,
      randomCharcters,
      tokenValidationTime
    );

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharcters}`;
    const template: string = forgotPasswordTemplate.passwordResetTemplate(
      existingUser.username!,
      resetLink
    );

    // SEND THE MAIL TO THE USER
    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: email,
      subject: 'Reset your password',
    });

    // SEND RESPONSE
    res.status(HTTP_STATUS.OK).json({
      message: 'Your password reset email was successfully sent',
    });
  }

  /**
   *@description : Send email that confirm the password was changes succesfully.
   * @param req
   * @param res
   */

  @joiValidation(passwordSchema)
  public async update(req: Request, res: Response): Promise<void> {
    const { password, confirmPassword } = req.body;
    const { token } = req.params;
    if (password !== confirmPassword) {
      throw new BadRequestError('Both password do not match');
    }
    const existingUser: IAuthDocument =
      await authService.getUserByPasswordToken(token);
    if (!existingUser) {
      throw new BadRequestError('Reset token has expired');
    }

    // UPDATE Properties
    existingUser.password = password;
    existingUser.passwordResetExpires = undefined;
    existingUser.passwordResetToken = undefined;

    // save Properties
    await existingUser.save();

    // SEND MAIL TO USER
    const templateParams: IResetPasswordParams = {
      username: existingUser.username!,
      email: existingUser.email!,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm:mm'),
    };

    const template: string =
      resetPasswordTemplate.passwordResetConfirmationTemplate(templateParams);

    emailQueue.addEmailJob('forgotPasswordEmail', {
      template,
      receiverEmail: existingUser.email!,
      subject: 'Password reset confirmation',
    });

    // SEND RESPONSE
    res.status(HTTP_STATUS.OK).json({
      message: 'Password successfully reset. Check your email...',
    });
  }
}
