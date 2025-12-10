import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService, // <-- Add this
  ) {}

  async validateUser(username: string, pass: string): Promise<User | null> {
    const user = await this.usersService.findByUsername(username);
    if (!user) return null;

    const match = await bcrypt.compare(pass, user.passwordHash);
    if (!match) return null;

    return user;
  }

  // 👇 PLACE THIS METHOD BELOW validateUser()
  async login(username: string, password: string) {
    const user = await this.validateUser(username, password);

    if (!user) {
      throw new UnauthorizedException('Invalid username or password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      roles: user.roles,
      branchId: user.branchId,
      employeeId: user.employeeId,
    });

    return {
      status: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        full_name: `${user.firstName} ${user.lastName}`.trim(),
        branchId: user.branchId,
        employeeId: user.employeeId,
        roles: user.roles,
      },
    };
  }
}
