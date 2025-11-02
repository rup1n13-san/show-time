import { Module } from '@nestjs/common';
import { SeeLaterService } from './see-later.service';
import { SeeLaterController } from './see-later.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [SeeLaterController],
  providers: [SeeLaterService],
})
export class SeeLaterModule {}
