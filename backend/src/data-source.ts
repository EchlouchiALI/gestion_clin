import { DataSource } from 'typeorm'

import { User } from './users/user.entity'
import { Ordonnance } from './ordonnances/ordonnance.entity'
import { RendezVous } from './rendezvous/rendezvous.entity'
import { Dossier } from './dossiers/dossier.entity'
import { Message } from './messages/message.entity'
import { Activity } from './activity/activity.entity'
import { ChatMessage } from '../chatbot/entities/chat-message.entity';


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
