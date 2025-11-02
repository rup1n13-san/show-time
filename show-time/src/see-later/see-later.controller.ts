import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpCode,
  Render,
} from '@nestjs/common';
import { SeeLaterService } from './see-later.service';

interface SeeLaterBody {
  userId: string;
  eventId: string;
}
@Controller('see-later')
export class SeeLaterController {
  constructor(private readonly seeLaterService: SeeLaterService) {}

  @Post()
  async create(@Body() data: SeeLaterBody) {
    return this.seeLaterService.create(data);
  }

  @Get('/user/:id')
  @Render('see-Later/list')
  async findAll(@Param('id') id: string) {
    const drafts = await this.seeLaterService.findAll(id);
    return { drafts };
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.seeLaterService.findOne(id);
  }

  @Delete(':id')
  @HttpCode(201)
  remove(@Param('id') id: string) {
    return this.seeLaterService.remove(id);
  }

  @Delete()
  @HttpCode(201)
  deleteAll() {
    return this.seeLaterService.deleteAll();
  }
}
