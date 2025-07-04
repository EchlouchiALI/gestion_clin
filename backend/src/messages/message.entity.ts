// backend/src/messages/message.entity.ts

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm'
import { User } from '../users/user.entity'

@Entity()
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
}
