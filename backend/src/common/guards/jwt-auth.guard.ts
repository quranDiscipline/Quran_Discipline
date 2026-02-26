import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ErrorMessageCode } from '../filters/error-message-code.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  override handleRequest<TUser = any>(err: any, user: TUser): TUser {
    if (err || !user) {
      throw err || new UnauthorizedException({
        message: 'Invalid or expired token',
        code: ErrorMessageCode.TOKEN_INVALID,
      });
    }
    return user;
  }
}
