import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { jwtDecode } from 'jwt-decode'; // ✅ import corrigé

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

    if (!authHeader) throw new UnauthorizedException('Token manquant');

    const token = authHeader.split(' ')[1];
    const decoded: any = jwtDecode(token); // ✅ appel correct

    if (!decoded || !decoded.role) throw new UnauthorizedException('Token invalide');

    return requiredRoles.includes(decoded.role);
  }
}
