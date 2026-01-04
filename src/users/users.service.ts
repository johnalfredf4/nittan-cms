import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
  @InjectRepository(User, 'nittan_app')
  private readonly usersRepo: Repository<User>,

  @InjectRepository(Role, 'nittan_app')
  private readonly rolesRepo: Repository<Role>,
) {}


  async create(dto: CreateUserDto): Promise<User> {
    const roles = await this.rolesRepo.find({
      where: { name: In(dto.roleNames) },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      username: dto.username,
      passwordHash,
      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,
      status: dto.status,
      roles,
    });

    return this.usersRepo.save(user);
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
    }
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.middleName !== undefined) user.middleName = dto.middleName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
    if (dto.status !== undefined) user.status = dto.status;

    if (dto.roleNames) {
      const roles = await this.rolesRepo.find({
        where: { name: In(dto.roleNames) },
      });
      user.roles = roles;
    }

    return this.usersRepo.save(user);
  }

  async findByUsername(username: string): Promise<User | null> {
    return await this.usersRepo.findOne({
      where: { username },
      relations: ['roles'], // 👈 LOAD ROLES
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async remove(id: number): Promise<void> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.usersRepo.remove(user);
  }

  async updatePassword(id: number, hash: string): Promise<void> {
  await this.usersRepo.update({ id }, { passwordHash: hash, isPasswordChanged: true, });
  }
}
