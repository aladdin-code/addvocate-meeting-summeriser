// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    // Add logging to help with debugging
    console.log('JWT Strategy - validate method called');
    console.log('JWT Payload:', payload);

    // Make sure payload has required fields
    if (!payload || !payload.sub) {
      console.log('Invalid JWT payload - missing sub field');
      throw new UnauthorizedException('Invalid token payload');
    }

    // Return the user data to be attached to the request
    return { userId: payload.sub, email: payload.email };
  }
}
