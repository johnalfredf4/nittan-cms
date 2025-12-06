export class CreateEmailTemplateDto {
  code: string;
  name: string;
  subject: string;
  body: string;
  category?: string;
}
