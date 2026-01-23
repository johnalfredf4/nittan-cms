import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserStatus } from '../common/enums/user-status.enum';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User, 'nittan_app')
    private readonly usersRepo: Repository<User>,

    @InjectRepository(Role, 'nittan_app')
    private readonly rolesRepo: Repository<Role>,
    private readonly http: HttpService, // ✅ ADD
    private readonly config: ConfigService, // optional but recommended
  ) {}

  /* =========================
     CREATE USER
  ========================== */
  async create(dto: CreateUserDto, jwtToken: string): Promise<User> {
    const roles = await this.rolesRepo.find({
      where: { name: In(dto.roleNames) },
    });

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.usersRepo.create({
      username: dto.username,
      emailAddress: dto.emailAddress,
      employeeId: dto.employeeId ? Number(dto.employeeId) : null, // ✅ ADD
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
    
     // ✅ SAVE FIRST
    const saved = await this.usersRepo.save(user);
  
    // ✅ AUTO EMAIL
    if (jwtToken && dto.password) {
      await this.sendCredentialsViaApi(
        saved,
        dto.password,
        jwtToken,
      );
    }
  
    return saved;
  }

  /* =========================
     UPDATE USER
  ========================== */
  async update(
    id: number,
    dto: UpdateUserDto,
    jwtToken: string,
  ): Promise<User> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: ['roles'],
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    // ✅ Declare outside so it's available later
    let plainPassword: string | undefined;
  
    // Password update
    if (dto.password) {
      plainPassword = dto.password; // 👈 capture before hashing
      user.passwordHash = await bcrypt.hash(dto.password, 10);
      user.isPasswordChanged = false;
    }
  
    // Basic fields
    if (dto.emailAddress !== undefined) {
      user.emailAddress = dto.emailAddress;
    }
    if (dto.employeeId !== undefined) {
      user.employeeId = Number(dto.employeeId);
    }
    if (dto.firstName !== undefined) user.firstName = dto.firstName;
    if (dto.middleName !== undefined) user.middleName = dto.middleName;
    if (dto.lastName !== undefined) user.lastName = dto.lastName;
  
    // Status (controller restricts admin-only)
    if (dto.status !== undefined) {
      user.status = dto.status;
    }
  
    // Branch update (optional)
    if (dto.branchId !== undefined) {
      user.branchId = dto.branchId;
    }

    //isPasswordChanged: false;
      
    // Roles
    if (dto.roleNames) {
      const roles = await this.rolesRepo.find({
        where: { name: In(dto.roleNames) },
      });
      user.roles = roles;
    }
  
    // ✅ SAVE FIRST
    const saved = await this.usersRepo.save(user);
  
    // ✅ SEND EMAIL ONLY IF CHECKED AND PASSWORD WAS CHANGED
    if (dto.sendEmail && plainPassword && jwtToken) {
      await this.sendCredentialsViaApi(
        saved,
        plainPassword,
        jwtToken,
      );
    }
  
    return saved;
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

  private async sendCredentialsViaApi(
    user: User,
    plainPassword: string,
    jwtToken: string,
  ) {
    const fullName = `${user.firstName} ${user.lastName}`;
  
    const message = `
      <p>Dear ${fullName},</p>
  
      <p>Your NOVA CMS account has been created or updated.</p>
  
      <p><strong>Login Details:</strong></p>
      <ul>
        <li><strong>Username:</strong> ${user.username}</li>
        <li><strong>Temporary Password:</strong> ${plainPassword}</li>
      </ul>
  
      <p>
        Please log in here:<br/>
        <a href="https://nova.nittancapitalfinance.com.ph/">
          https://nova.nittancapitalfinance.com.ph/
        </a>
      </p>
  
      <p>For security reasons, please change your password after logging in.</p>
  
      <p>— NOVA CMS Team</p>
    `;
  
    const payload = {
      to: user.emailAddress,
      subject: 'Your NOVA CMS Login Credentials',
      message,
      referenceId: user.id,
      emailTemplateId: 3, // or null if you're not using templates
    };
  
    const url = this.config.get('EMAIL_API_URL') || 'http://localhost:3000/email/send';
  
    await firstValueFrom(
      this.http.post(url, payload, {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          'Content-Type': 'application/json',
        },
      }),
    );
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

  /* =========================
   GENERATE TEMP PASSWORD
========================== */
async generateTempPassword(userId: number, jwtToken?: string) {
  const user = await this.usersRepo.findOne({
      where: { id: userId },
    });
  
    if (!user) {
      throw new NotFoundException('User not found');
    }
  
    const tempPassword = this.generateRandomPassword(12);
    const passwordHash = await bcrypt.hash(tempPassword, 10);
  
    user.passwordHash = passwordHash;
    user.isPasswordChanged = false;
  
    await this.usersRepo.save(user);
  
    // OPTIONAL: Send email via your existing API
    if (jwtToken) {
      await this.sendCredentialsViaApi(user, tempPassword, jwtToken);
    }
  
    return {
      message: 'Temporary password generated successfully',
      tempPassword, // ⚠️ UI should display ONCE
    };
  }

}
