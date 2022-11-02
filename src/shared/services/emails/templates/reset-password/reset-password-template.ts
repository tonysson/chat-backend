import fs from 'fs';
import ejs from 'ejs';
import { IResetPasswordParams } from '@user/interfaces/user.interface';

class ResetPasswordTemplate {
  public passwordResetConfirmationTemplate(
    templateParams: IResetPasswordParams
  ): string {
    const { email, username, date , ipaddress } = templateParams;
    return ejs.render(
      fs.readFileSync(__dirname + '/reset-password-template.ejs', 'utf8'),
      {
        username,
        email,
        ipaddress,
        date,
        image_url:
          'https://www.freeiconspng.com/thumbs/forgot-password-icon/forgot-password-icon-32.png',
      }
    );
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate =
  new ResetPasswordTemplate();
