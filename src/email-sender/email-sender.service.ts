import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmailSendLog } from './entities/email-send-log.entity';

@Injectable()
export class EmailSenderService {

  // ✅ DECLARE emailLogRepo via constructor injection
  constructor(
    @InjectRepository(EmailSendLog, 'nittan_app')
    private readonly emailLogRepo: Repository<EmailSendLog>,
  ) {}
  
  private readonly transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Gmail requires STARTTLS
    auth: {
      user: 'nittancloudstorage@gmail.com',
      pass: 'qtbrjjlwftzfpxwp',
    },
  });

  async sendEmail(dto: {
    to: string;
    subject: string;
    message: string;
    referenceId: number;
    emailTemplateId?: number;
  }) {
    let sentStatus = false;
    let errorMessage: string | null = null;

    try {
      await this.transporter.sendMail({
        from: process.env.SMTP_FROM,
        to: dto.to,
        subject: dto.subject,
        html: dto.message,
      });

      sentStatus = true;
    } catch (error) {
      errorMessage = error.message;
    }

    // 🔹 SAVE EMAIL LOG
    await this.emailLogRepo.save({
      toEmail: dto.to,
      emailTemplateId: dto.emailTemplateId,
      subject: dto.subject,
      message: dto.message,
      referenceId: dto.referenceId,
      sentStatus,
      errorMessage,
    });

    if (!sentStatus) {
      throw new Error(errorMessage);
    }

    return {
      status: true,
      message: 'Email sent and logged successfully',
    };
  }
}
