import { Controller, Post, UseGuards, Req, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto } from './dto/change-password.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
  ) {}

  // LOGIN ENDPOINT (Local strategy)
  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: any) {
    const user = req.user;

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

  // (Optional) CHANGE PASSWORD ENDPOINT – only if you really want it
  // You can protect this with JWT guard later if needed.
  @Post('change-password')
  async changePassword(
    @Body() dto: ChangePasswordDto,
    @Req() req: any,
  ) {
    const requesterUsername = req.user?.username ?? dto.username; // fallback if needed
    return this.authService.changePassword(dto, requesterUsername);
  }
}
