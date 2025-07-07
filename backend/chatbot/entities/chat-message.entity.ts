import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm'
  import { User } from '../../src/users/user.entity' // ✅ chemin corrigé
  
  @Entity()
  export class ChatMessage {
    @PrimaryGeneratedColumn()
    id: number
  
    @Column()
    from: 'user' | 'bot'
  
    @Column('text')
    text: string
  
    @CreateDateColumn()
    createdAt: Date
  
    @ManyToOne(() => User, (user) => user.chatMessages, { onDelete: 'CASCADE' })
    user: User
  }
  