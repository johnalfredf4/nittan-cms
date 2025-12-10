import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UsersModule } from '../users/users.module';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    UsersModule,
    PassportModule.register({ session: false }), // make explicit
    JwtModule.register({
      global: true, // 🔍 allows injection without re-importing
      secret: process.env.JWT_SECRET || 'super-secret-key', // improved
      signOptions: { expiresIn: '1d' }, // recommended longer expiration
    }),
  ],
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
  ],
  controllers: [AuthController],
  exports: [
    AuthService, // 🔥 allow login() reuse in other modules
    JwtModule,   // allow token verification elsewhere
  ],
})
export class AuthModule {}
