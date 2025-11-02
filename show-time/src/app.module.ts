import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { GroupesModule } from './groupes/groupes.module';
import { TicketsModule } from './tickets/tickets.module';
import { UsersModule } from './users/users.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { SeeLaterModule } from './see-later/see-later.module';
import { EmailModule } from './email/email.module';
import { EventsService } from './events/events.service';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    PrismaModule,
    EventsModule,
    TicketsModule,
    AuthModule,
    GroupesModule,
    SeeLaterModule,
    EmailModule,
    CloudinaryModule,
    PaymentsModule,
    PaymentsModule,
  ],
  controllers: [AppController],
  providers: [AppService, EventsService],
})
export class AppModule {}
