import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsModule } from 'src/events/events.module';
import { GroupesModule } from 'src/groupes/groupes.module';
import { TicketsModule } from 'src/tickets/tickets.module';

@Module({
  imports: [PrismaModule, EventsModule, GroupesModule, TicketsModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
