import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Render,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Event } from '@prisma/client';
import type { Response } from 'express';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { GroupesService } from 'src/groupes/groupes.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FilterEventDto } from './dto/filter-event.dto';
import { UpdateEventDto } from './dto/update-user.dto';
import { EventType } from './enum/event-type.enum';
import { EventsService } from './events.service';
import type { Request } from 'express';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly cloudinaryService: CloudinaryService,
    private readonly groupesService: GroupesService,
  ) {}

  @Get('dash')
  @Render('admin/dashbordadmin')
  async findAll() {
    const events = await this.eventsService.findAll();
    return events;
  }

  @Get('/totalEvents')
  async getTotalEvents() {
    const events = this.findAll();
    return (await events).length;
  }

  @Get('list')
  @Render('events/list')
  async showEventsView(@Query() filters: FilterEventDto) {
    const res = await this.eventsService.findAllWithFilters(filters);
    const events = res.events;
    const total = res.total;
    return {
      events,
      total,
      currentFilters: filters,
    };
  }

  // @Get('')
  @Get(':id/details')
  @Render('events/detailsevent')
  async findOne(@Param('id') id: string, @Req() req: Request) {
    const event = await this.eventsService.findOneWithGroups(id);
    const userCookie = req.cookies?.user;
    const user = userCookie ? JSON.parse(userCookie) : null;
    return { event, user };
  }

  @Post()
  @UseInterceptors(
    FilesInterceptor('imageUrls', 5, {
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max par fichier
      },
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
          return callback(new Error('Only image files are allowed!'), false);
        }
        callback(null, true);
      },
    }),
  )
  async createEventWithImages(
    @UploadedFiles() files: Express.Multer.File[],
    @Body() data: CreateEventDto,
    @Res() res: Response,
  ) {
    try {
      const imageUrls = await this.cloudinaryService.uploadMultipleImages(
        files,
        'events',
      );

      const event = await this.eventsService.create({
        ...data,
        imageUrls,
      });
      if (!event) {
        throw new Error('Failed to create event');
      }
      return res.redirect(`/events/${event.id}/details`);
    } catch (error) {
      console.error('Error creating event:', error);

      return res.render('events/addform', {
        eventTypes: EventType,
        groupes: await this.groupesService.findAll(),
        error: `Failed to create event: ${error.message}`,
      });
    }
  }
  @Get('add')
  @Render('events/addform')
  async createEvents() {
    const groupes = await this.groupesService.findAll();

    return {
      eventTypes: EventType,
      groupes: groupes,
    };
  }

  @Post('addform')
  async create(@Body() data: CreateEventDto) {
    return await this.eventsService.create(data);
  }
  // async create(@Body() data: CreateEventDto): Promise<Event> {
  //   return await this.eventsService.create(data);
  // }

  //****************************************** */
  @Get(':id/update')
  @Render('events/updateform')
  async updateEvents(@Param('id') id: string) {
    const groupes = await this.groupesService.findAll();
    const event = await this.eventsService.findOne(id);

    return { groupes, event, eventTypes: EventType };
  }

  @Put(':id/updated')
  async update(
    @Param('id') id: string,
    @Body() data: UpdateEventDto,
  ): Promise<Event> {
    return await this.eventsService.update(id, data);
  }

  @Get(':id/delete')
  async delete(@Param('id') id: string, @Res() res: Response) {
    const event = await this.eventsService.findOne(id);

    if (event && event.imageUrls && event.imageUrls.length > 0) {
      // Supprimer les images de Cloudinary
      const deletePromises = event.imageUrls.map((url) => {
        return this.cloudinaryService.deleteImage(url);
      });

      await Promise.all(deletePromises);
    }

    await this.eventsService.delete(id);
    res.redirect('/users/dash');
  }

  @Post(':id/groupes')
  async addGroups(
    @Param('id') eventId: string,
    @Body('groupIds') groupIds: string[],
  ) {
    return await this.eventsService.addGroupsToEvent(eventId, groupIds);
  }

  @Get(':id/detail')
  async getEventWithGroups(@Param('id') id: string) {
    return await this.eventsService.findOneWithGroups(id);
  }
}
