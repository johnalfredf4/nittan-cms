import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard) // applies to all methods
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // CREATE USER → AUTO SEND EMAIL
  @Post()
  @Roles('IT - CMS Admin', 'Execom - CEO')
  create(@Req() req: Request, @Body() dto: CreateUserDto) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.usersService.create(dto, token);
  }

  // LIST USERS
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  // GET SINGLE USER
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }

  // UPDATE USER → SEND EMAIL ONLY IF CHECKED
  @Patch(':id')
  @Roles('IT - CMS Admin')
  update(
    @Req() req: Request,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.usersService.update(+id, dto, token);
  }

  // SOFT DELETE USER
  @Delete(':id')
  @Roles('IT - CMS Admin')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }

  // GENERATE TEMP PASSWORD
@Post(':id/generate-temp-password')
@Roles('IT - CMS Admin', 'Execom - CEO')
async generateTempPassword(
    @Req() req: Request,
    @Param('id') id: string,
  ) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    return this.usersService.generateTempPassword(+id, token);
  }
}
