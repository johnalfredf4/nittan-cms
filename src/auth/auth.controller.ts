import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { Body, BadRequestException } from '@nestjs/common';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: any) {
    const user = req.user;

    // Convert roles from entity to string array
    const roles = user.roles?.map((r: any) => r.name) ?? [];

    const payload = {
      sub: user.id,
      username: user.username,
      roles,
      branchId: user.branchId,
      employeeId: user.employeeId,
    };

    return {
      status: true,
      token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        username: user.username,
        full_name: `${user.firstName} ${user.lastName}`.trim(),
        branchId: user.branchId,
        employeeId: user.employeeId,
        roles,
      },
    };
  }
}

@Controller('auth')
export class AuthController {

  constructor(private readonly authService: AuthService) {}

  // ✨ Change or Reset Password Endpoint
  @UseGuards(AuthGuard('jwt'))
  @Post('change-password')
  async changePassword(@Body() dto: ChangePasswordDto, @Req() req: any) {
    const requesterUsername = req.user.username;

    return this.authService.changePassword(dto, requesterUsername);
  }
}
