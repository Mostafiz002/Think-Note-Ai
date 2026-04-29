import { RegisterDto } from './../auth/dto/register.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async getUserByEmail(email: string) {
    return await this.prismaService.user.findFirst({ where: { email } });
  }

  async createUser(registerDto: RegisterDto) {
    return await this.prismaService.user.create({ data: registerDto });
  }

  async markEmailVerified(email: string) {
    return await this.prismaService.user.update({
      where: { email },
      data: { emailVerified: true },
    });
  }

  async setRefreshTokenHash(userId: number, refreshTokenHash: string | null) {
    return await this.prismaService.user.update({
      where: { id: userId },
      data: { refreshTokenHash },
    });
  }
}
