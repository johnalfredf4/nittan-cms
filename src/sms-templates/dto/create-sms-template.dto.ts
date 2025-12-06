import { IsNotEmpty } from 'class-validator';

export class CreateSmsTemplateDto {
  @IsNotEmpty({ message: 'Template Code is required' })
  templateCode: string;

  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @IsNotEmpty({ message: 'Message is required' })
  message: string;
}
