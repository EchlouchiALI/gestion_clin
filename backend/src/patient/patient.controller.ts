import { Controller, Get} from '@nestjs/common';
import { Roles } from 'src/common/decorators/roles.decorator';



@Controller('patient')
export class PatientController {
  @Get('profile')
  @Roles('patient')
  getProfile() {
    return {
      message: 'Bienvenue cher patient 🧑‍💼',
    };
  }
}
