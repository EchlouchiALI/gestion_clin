import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UsersService } from './users.service'
import { UsersController } from './users.controller'
import { User } from './user.entity'

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ✅ seulement ça
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // ✅ pour être utilisé dans AdminModule
})
export class UsersModule {}
