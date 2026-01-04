import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsSendLog } from './entities/sms-send-log.entity';

@Injectable()
export class SmsSenderService {
  private readonly API_URL = 'http://gateway.onewaysms.com.au:10001/api.aspx';
  private readonly API_USERNAME = 'APIKCHQ2NOSPC';
  private readonly API_PASSWORD = 'APIKCHQ2NOSPCKCHQ2';
  private readonly SENDER_ID = 'Nittan';

  constructor(
    @InjectRepository(SmsSendLog, 'nittan_app')
    private readonly smsLogRepo: Repository<SmsSendLog>,
  ) {}

  async sendSms(dto: {
    to: string;
    message: string;
    referenceId: number;
    agentName: string;
  }) {
    let sentStatus = false;
    let errorMessage: string | null = null;

    try {
      const params = new URLSearchParams({
        apiusername: this.API_USERNAME,
        apipassword: this.API_PASSWORD,
        senderid: this.SENDER_ID,
        mobileno: dto.to,
        message: dto.message,
        languagetype: '1',
      });

      const response = await axios.get(`${this.API_URL}?${params.toString()}`);
      const result = response.data.toString().trim();

      if (Number(result) > 0) {
        sentStatus = true;
      } else {
        errorMessage = result;
      }
    } catch (err) {
      errorMessage = err.message;
    }

    // 🔹 SAVE LOG
    await this.smsLogRepo.save({
      toMobile: dto.to,
      message: dto.message,
      referenceId: dto.referenceId,
      agentName: dto.agentName,
      sentStatus,
      errorMessage,
    });

    if (!sentStatus) {
      throw new Error(errorMessage ?? 'SMS sending failed');
    }

    return {
      status: true,
      message: 'SMS sent and logged successfully',
    };
  }
}
