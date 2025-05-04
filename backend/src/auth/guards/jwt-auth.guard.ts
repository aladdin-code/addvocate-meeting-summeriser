// auth/guards/jwt-auth.guard.ts
import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

// Ensure this constant matches what you've defined in your public decorator
export const IS_PUBLIC_KEY = 'isPublic';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    // Check if route is marked as public
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    console.log('JwtAuthGuard - canActivate called');
    console.log('Route is public:', isPublic);

    if (isPublic) {
      return true;
    }

    // For protected routes, validate JWT
    return super.canActivate(context);
  }

  // This is a critical method that was likely missing in your implementation
  handleRequest(err: any, user: any, info: { message: any }) {
    console.log('JwtAuthGuard - handleRequest called');
    console.log('Error:', err);
    console.log('User:', user);
    console.log('Info:', info);

    // If authentication failed or no user was found, throw an exception
    if (err || !user) {
      throw (
        err ||
        new UnauthorizedException(
          'Authentication failed: ' + (info?.message || 'Invalid token'),
        )
      );
    }

    // Authentication succeeded, return the user
    return user;
  }
}
