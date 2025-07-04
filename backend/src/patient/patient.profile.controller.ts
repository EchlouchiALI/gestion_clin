import {
    Controller,
    Get,
    Req,
    UseGuards,
  } from '@nestjs/common';
  import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
  import { RolesGuard } from 'src/common/guards/roles.guard';
  import { Roles } from 'src/common/decorators/roles.decorator';
  import { UsersService } from 'src/users/users.service';
  import { Request as ExpressRequest } from 'express';
  
  interface AuthenticatedRequest extends ExpressRequest {
    user: {
      id: number;
      email: string;
      role: string;
    };
  }
  
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('patient')
  @Controller('patient')
  export class PatientProfileController {
    constructor(private readonly usersService: UsersService) {}
  
    @Get('me')
    async getMyProfile(@Req() req: AuthenticatedRequest) {
      return this.usersService.findById(req.user.id);
    }
  }
  