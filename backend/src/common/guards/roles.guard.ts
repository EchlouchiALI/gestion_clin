import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { jwtDecode } from 'jwt-decode';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token manquant ou mal formé');
    }

    const token = authHeader.split(' ')[1];

    try {
      const decoded: any = jwtDecode(token);

      if (!decoded || !decoded.role) {
        throw new UnauthorizedException('Token invalide ou sans rôle');
      }

      return requiredRoles.includes(decoded.role);
    } catch (err) {
      throw new UnauthorizedException('Token invalide ou corrompu');
    }
  }
}
