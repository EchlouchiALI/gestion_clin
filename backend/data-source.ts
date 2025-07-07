import { DataSource } from 'typeorm'

import { User } from './src/users/user.entity'
import { Ordonnance } from './src/ordonnances/ordonnance.entity'
import { RendezVous } from './src/rendezvous/rendezvous.entity'
import { Dossier } from './src/dossiers/dossier.entity'
import { Message } from './src/messages/message.entity'
import { Activity } from './src/activity/activity.entity'
import { ChatMessage } from './chatbot/entities/chat-message.entity' // ✅ hors src

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '123456789',
  database: 'clinique_db',
  synchronize: false,
  logging: true,
  entities: [
    User,
    Ordonnance,
    RendezVous,
    Dossier,
    Message,
    Activity,
    ChatMessage,
  ],
  migrations: ['src/migrations/*.ts'],
})
