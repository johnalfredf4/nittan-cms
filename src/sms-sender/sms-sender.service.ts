import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class SmsSenderService {

  private readonly API_URL = 'http://gateway.onewaysms.com.au:10001/api.aspx';

  private readonly API_USERNAME = 'API5QNDTEXOKT';
  private readonly API_PASSWORD = 'API5QNDTEXOKT5QNDT';
  private readonly SENDER_ID = 'ONEWAY';

  async sendSMS(to: string, message: string) {
    try {
      const params = new URLSearchParams({
        apiusername: this.API_USERNAME,
        apipassword: this.API_PASSWORD,
        senderid: this.SENDER_ID,
        mobileno: to,
        message: message,
        languagetype: '1',
      });

      const requestUrl = `${this.API_URL}?${params.toString()}`;

      const response = await axios.get(requestUrl);

      const result = response.data.toString().trim();

      if (Number(result) > 0) {
        return {
          status: true,
          message: 'SMS sent successfully',
          mtId: result,
        };
      } else {
        return {
          status: false,
          message: 'SMS sending failed',
          errorCode: result,
        };
      }

    } catch (error) {
      return {
        status: false,
        message: 'Gateway connection failed',
        error: error.message,
      };
    }
  }
}
