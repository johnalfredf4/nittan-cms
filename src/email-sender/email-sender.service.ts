import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailSenderService {
  private readonly transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Gmail requires STARTTLS
    auth: {
      user: 'nittancloudstorage@gmail.com',
      pass: 'qtbrjjlwftzfpxwp',
    },
  });

  async sendEmail(to: string, subject: string, message: string) {
    try {
      const result = await this.transporter.sendMail({
        from: 'nittancloudstorage@gmail.com',
        to,
        subject,
        html: message,
      });

      return {
        status: true,
        message: "Email sent successfully",
        response: result,
      };
    } catch (error) {
      return {
        status: false,
        message: "Failed to send email",
        error: error.message,
      };
    }
  }
}
