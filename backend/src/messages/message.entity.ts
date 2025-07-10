import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm'
import { User } from '../users/user.entity'

@Entity() // ✅ OBLIGATOIRE pour TypeORM
export class Message {
  @PrimaryGeneratedColumn()
  id: number

  @Column()
  content: string

  @Column()
  senderRole: 'patient' | 'medecin'

  @CreateDateColumn()
  createdAt: Date

  @ManyToOne(() => User, { eager: true })
  sender: User

  @ManyToOne(() => User)
  receiver: User

  @Column({ default: false })
  isRequest: boolean
}
