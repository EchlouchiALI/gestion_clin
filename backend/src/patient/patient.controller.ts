import {
  Controller,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common'
import { Roles } from 'src/common/decorators/roles.decorator'
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'
import { RolesGuard } from 'src/common/guards/roles.guard'
import { UsersService } from 'src/users/users.service'
import { RendezvousService } from 'src/rendezvous/rendezvous.service'

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('patient')
@Controller('patients')
export class PatientsController {
  constructor(
    private readonly usersService: UsersService,
    private readonly rendezvousService: RendezvousService
  ) {}

  @Get('me')
  async getMyProfile(@Request() req) {
    const userId = req.user.sub
    return this.usersService.findById(userId)
  }

  @Get('rendezvous')
  async getMyRendezvous(@Request() req) {
    const userId = req.user.sub
    return this.rendezvousService.findByPatient(userId)
  }
}
