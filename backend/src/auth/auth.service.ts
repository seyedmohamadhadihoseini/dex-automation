import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AppConfigService } from '../config/config.service';
import { LoginDto, LoginResponseDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: AppConfigService,
  ) {}

  async validateUser(username: string, password: string): Promise<any> {
    const defaultUsername = this.configService.defaultUsername;
    const defaultPassword = this.configService.defaultPassword;

    if (username === defaultUsername && password === defaultPassword) {
      return { username };
    }
    return null;
  }

  async login(loginDto: LoginDto): Promise<LoginResponseDto> {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { username: user.username };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        username: user.username,
      },
    };
  }
}

