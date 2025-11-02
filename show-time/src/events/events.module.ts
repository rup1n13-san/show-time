import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma/prisma.module';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';
import { GroupesModule } from 'src/groupes/groupes.module';

@Module({
  imports: [PrismaModule, CloudinaryModule, GroupesModule],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService],
})
export class EventsModule {}
