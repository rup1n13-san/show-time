import { Controller, Get, Query, Render, Req } from '@nestjs/common';
import type { Request } from 'express';
import { AppService } from './app.service';
import {
  FilterEventDto,
  SortBy,
  SortOrder,
} from './events/dto/filter-event.dto';
import { EventsService } from './events/events.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly eventsService: EventsService,
  ) {}

  @Get()
  @Render('Userpages/homepublic')
  async home(@Req() req: Request, @Query() filters: FilterEventDto) {
    // Extract user from cookie if it exists
    const userCookie = req.cookies?.user;
    const user = userCookie ? JSON.parse(userCookie) : null;

    if (user != null) {
      const searchFilter: FilterEventDto = {
        ...filters,
        sortBy: filters.sortBy || SortBy.START_DATE,
        sortOrder: filters.sortOrder || SortOrder.ASC,
      };
      const events = await this.eventsService.findAllWithFilters(searchFilter);

      return {
        title: 'Show Time - Home',
        user: user,
        events,
        currentFilters: searchFilter,
      };
    } else {
      const [concerts, festivals] = await Promise.all([
        this.eventsService.findAllWithFilters({
          typeEvent: 'Concert',
          sortBy: SortBy.START_DATE,
          sortOrder: SortOrder.ASC,
        }),
        this.eventsService.findAllWithFilters({
          typeEvent: 'Festival',
          sortBy: SortBy.START_DATE,
          sortOrder: SortOrder.ASC,
        }),
      ]);

      //console.log([concerts, festivals]);

      return {
        title: 'Show Time - Home',
        user: user,
        concerts: concerts.events.slice(0, 4), // Limiter à 4
        concertsTotal: concerts.total,
        festivals: festivals.events.slice(0, 4),
        festivalsTotal: festivals.total,
      };
    }
  }
}
