import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { User } from './user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async findAllByRole(role: 'admin' | 'medecin' | 'patient') {
    return this.userRepo.find({ where: { role } })
  }

  async deleteUser(id: string) {
    await this.userRepo.delete(id)
    return { message: 'Patient supprimé avec succès' }
  }
  

async createPatient(data: any) {
  const hashedPassword = await bcrypt.hash(data.password, 10)
  const newUser = this.userRepo.create({
    ...data,
    age: Number(data.age),
    password: hashedPassword,
    role: 'patient',
    isActive: true,
  })
  return this.userRepo.save(newUser)
}

}
