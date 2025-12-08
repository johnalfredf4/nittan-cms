import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const nittanConnectionConfig: TypeOrmModuleOptions = {
  name: 'nittan',
  type: 'mssql',
  host: 'nittan-rds.chsm6icykzm3.ap-southeast-1.rds.amazonaws.com',
  port: 1433,
  username: 'bong3',
  password: 'bong3',
  database: 'Nittan',
  synchronize: false,
  requestTimeout: 6000000,   // 60 seconds for query execution
  entities: [], // ALWAYS EMPTY FOR READ DB
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 6000000,   // 60 seconds for DB connection
  },
};

export default nittanConnectionConfig;
