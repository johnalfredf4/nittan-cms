import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { LoanAssignment } from '../loan-assignment/entities/loan-assignment.entity';
import { RotationState } from '../loan-assignment/entities/rotation-state.entity';
// plus all your CMS tables

const ormconfigNittanApp: TypeOrmModuleOptions = {
  name: 'nittan_app',
  type: 'mssql',
  host: 'nittan-rds.chsm6icykzm3.ap-southeast-1.rds.amazonaws.com',
  port: 1433,
  username: 'bong3',
  password: 'bong3',
  database: 'Nittan-App',
  synchronize: false,
  requestTimeout: 6000000,   // 60 seconds for query execution
  entities: [
    LoanAssignment,
    RotationState,
    // include other CMS entities already present
  ],
  options: {
    encrypt: false,
    trustServerCertificate: true,
    connectTimeout: 6000000,   // 60 seconds for DB connection
  },
};

export default ormconfigNittanApp;
