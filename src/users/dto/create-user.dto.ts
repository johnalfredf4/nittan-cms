import {
  IsString,
  IsEmail,
  IsOptional,
  IsEnum,
  IsArray,
} from 'class-validator';
import { UserStatus } from '../../common/enums/user-status.enum';

export class CreateUserDto {
  @IsString()
  username: string;

  @IsEmail()
  emailAddress: string;

  @IsString()
  password: string;

  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsInt()
  status?: UserStatus; // defaults to ACTIVE

  @IsArray()
  @IsString({ each: true })
  roleNames: string[]; // e.g. ["Collection Agent - Head Office"]
}
