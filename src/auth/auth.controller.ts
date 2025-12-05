import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req: any) {
    const user = req.user;

    const payload = {
      id: user.id,
      username: user.username,
      roles: user.roles.map((r: any) => r.name),
    };

    return {
      token: this.jwtService.sign(payload),
      user: payload,
    };
  }
}
