import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EmailSenderController } from './email-sender.controller';
import { EmailSenderService } from './email-sender.service';

import { EmailLogsController } from './email-logs.controller';
import { EmailLogsService } from './email-logs.service';

import { EmailSendLog } from './entities/email-send-log.entity';

@Module({
  imports: [
    // ✅ Register entity with nittan_app connection
    TypeOrmModule.forFeature([EmailSendLog], 'nittan_app'),
  ],
  controllers: [
    EmailSenderController,
    EmailLogsController, // ✅ add logs controller
  ],
  providers: [
    EmailSenderService,
    EmailLogsService, // ✅ add logs service
  ],
})
export class EmailSenderModule {}
