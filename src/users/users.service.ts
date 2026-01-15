import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from '../common/enums/user-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'nittan_app')
    private readonly usersRepo: Repository<User>,

    @InjectRepository(Role, 'nittan_app')
    private readonly rolesRepo: Repository<Role>,
  ) {}

  /* =========================
     CREATE USER
  ========================== */
  async create(dto: CreateUserDto): Promise<User> {
    const roles = await this.rolesRepo.find({
      where: { name: In(dto.roleNames) },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      username: dto.username,
      emailAddress: dto.emailAddress,

      passwordHash,

      firstName: dto.firstName,
      middleName: dto.middleName,
      lastName: dto.lastName,

      status: dto.status ?? UserStatus.ACTIVE,
      isPasswordChanged: false,

      // ✅ Branch support
      branchId: dto.branchId ?? null,

      roles,
    });

    return await this.usersRepo.save(user);
  }

  /* =========================
     UPDATE USER
  ========================== */
  async update(id: number, dto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepo.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Password update
    if (dto.password) {
      user.passwordHash = await bcrypt.hash(dto.password, 10);
      user.isPasswordChanged = true;
    }

    // Basic fields
    if (dto.emailAddress !== undefined) {
      user.emailAddress = dto.emailAddress;
    }
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.middleName !== undefined) user.middleName = dto.middleName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;

    // Status (controller should restrict admin-only)
    if (dto.status !== undefined) {
      user.status = dto.status;
    }

    // ✅ Branch update (optional)
    if (dto.branchId !== undefined) {
      user.branchId = dto.branchId;
    }

    // Roles
    if (dto.roleNames) {
      const roles = await this.rolesRepo.find({
        where: { name: In(dto.roleNames) },
      });
      user.roles = roles;
    }

    return this.usersRepo.save(user);
  }

  /* =========================
     QUERIES
  ========================== */
  async findByUsername(username: string): Promise<User | null> {
    return await this.usersRepo.findOne({
      where: { username },
      relations: ['roles', 'branch'],
    });
  }


  async findAll(): Promise<User[]> {
    return this.usersRepo.find({
      relations: ['roles', 'branch'],
    });
  }


  async findOne(id: number): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['roles', 'branch'],
    });
  
    if (!user) throw new NotFoundException('User not found');
    return user;
  }


  /* =========================
     SOFT DELETE
  ========================== */
  async remove(id: number) {
    return this.usersRepo.update(id, {
      status: UserStatus.DELETED,
    });
  }

  /* =========================
     PASSWORD UPDATE
  ========================== */
  async updatePassword(id: number, hash: string): Promise<void> {
    await this.usersRepo.update(
      { id },
      { passwordHash: hash, isPasswordChanged: true },
    );
  }
}
