import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
import { AuthUser } from '../../common/decorators/current-user.decorator';
import { ErrorMessageCode } from '../../common/filters/error-message-code.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_ACCESS_SECRET') || 'default-secret',
    });
  }

  async validate(payload: {
    sub: string;
    email: string;
    role: string;
    sex: string;
  }): Promise<AuthUser> {
    const user = await this.usersService.findById(payload.sub);

    if (!user.isActive) {
      throw new UnauthorizedException({
        message: 'User account is inactive',
        code: ErrorMessageCode.USER_INACTIVE,
      });
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      sex: user.sex,
      profilePictureUrl: user.profilePictureUrl,
      mustChangePassword: (user as any).mustChangePassword || false,
    } as AuthUser;
  }
}
