import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsInt,
} from 'class-validator';
import { UserStatus } from '../../common/enums/user-status.enum';

export class UpdateUserDto {

  @IsOptional()
  @IsEmail()
  emailAddress?: string;
  
  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsString()
  firstName?: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsOptional()
  @IsString()
  lastName?: string;

  @IsOptional()
  @IsInt()
  status?: UserStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  roleNames?: string[];

  @IsOptional()
  @IsInt()
  branchId?: number;
}
