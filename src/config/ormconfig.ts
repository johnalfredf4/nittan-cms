import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

const ormconfig: TypeOrmModuleOptions = {
  type: 'mssql',
  host: 'nittan-rds.chsm6icykzm3.ap-southeast-1.rds.amazonaws.com',
  port: 1433,
  username: 'bong3',
  password: 'bong3',
  database: 'Nittan-App',
  entities: [User, Role],
  synchronize: false,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default ormconfig;
