import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Role } from '../roles/entities/role.entity';

const ormconfig: TypeOrmModuleOptions = {
  type: 'mssql',
  host: 'YOUR_SQL_SERVER_HOST',
  port: 1433,
  username: 'YOUR_SQL_USER',
  password: 'YOUR_SQL_PASSWORD',
  database: 'Nittan-App',
  entities: [User, Role],
  synchronize: false,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

export default ormconfig;
