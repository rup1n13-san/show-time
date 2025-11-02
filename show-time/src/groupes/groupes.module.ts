import { Module } from '@nestjs/common';
import { GroupesService } from './groupes.service';
import { GroupesController } from './groupes.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [GroupesController],
  providers: [GroupesService],
  exports: [GroupesService],
})
export class GroupesModule {}
