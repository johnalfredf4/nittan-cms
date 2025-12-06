import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { EmailTemplate } from '../email-templates/entities/email-template.entity';
import { EmailTemplateVersion } from '../email-templates/entities/email-template-version.entity';
import { SmsTemplate } from '../sms-templates/entities/sms-template.entity';
import { ProductType } from '../product-types/entities/product-type.entity';
import { AccountRetention } from '../account-retention/entities/account-retention.entity';


const ormconfig: TypeOrmModuleOptions = {
  type: 'mssql',
  host: 'nittan-rds.chsm6icykzm3.ap-southeast-1.rds.amazonaws.com',
  port: 1433,
  username: 'bong3',
  password: 'bong3',
  database: 'Nittan-App',
  entities: [
    User,
    Role,
    EmailTemplate,
    EmailTemplateVersion,
    SmsTemplate,
    ProductType, 
    AccountRetention, // 👈 IMPORTANT
  ],
  synchronize: false,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default ormconfig;
