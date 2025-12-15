import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailSenderController } from './email-sender.controller';
import { EmailSenderService } from './email-sender.service';
import { EmailSendLog } from './entities/email-send-log.entity';

@Module({
   imports: [
    TypeOrmModule.forFeature([EmailSendLog], 'nittan_app'),
  ],
  controllers: [EmailSenderController],
  providers: [EmailSenderService],
})
export class EmailSenderModule {}
