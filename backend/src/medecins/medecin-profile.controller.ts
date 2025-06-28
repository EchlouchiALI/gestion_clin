import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { MedecinsService } from './medecins.service';
import { RendezvousService } from 'src/rendezvous/rendezvous.service';

@Controller('medecin') // base route : /medecin
@UseGuards(JwtAuthGuard)
export class MedecinProfileController {
  constructor(
    private readonly medecinsService: MedecinsService,
    private readonly rendezvousService: RendezvousService,
  ) {}

  @Get('profile') // 👈 ajoute cette route
  getProfile(@Req() req) {
    return this.medecinsService.findOne(+req.user.id);
  }

  @Get('patients')
  getMyPatients(@Req() req) {
    return this.medecinsService.findPatientsByMedecin(req.user.id);
  }

  @Get('rendezvous')
  getMyRendezvous(@Req() req) {
    return this.rendezvousService.findByMedecinId(req.user.id);
  }

  @Get('ordonnances')
  getMyOrdonnances(@Req() req) {
    return this.medecinsService.findOrdonnancesByMedecin(req.user.id);
  }
}
