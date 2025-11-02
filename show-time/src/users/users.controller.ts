import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Render,
  UseGuards,
  Req,
  Res,
  BadRequestException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { OwnerGuard } from 'src/auth/guards/owner.guard';
import { EventsService } from 'src/events/events.service';
import { GroupesService } from 'src/groupes/groupes.service';
import { TicketsService } from 'src/tickets/tickets.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { CreateUserDto } from './dto/create_users.dto';
import { UpdateUserDto } from './dto/update_users.dto';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthViewGuard } from 'src/auth/guards/jwt-auth-view.guard';
import type { Response } from 'express';

@Controller('users')
@UseGuards(JwtAuthGuard) // Toutes les routes nécessitent d'être connecté
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventsService: EventsService,
    private readonly groupesService: GroupesService,
    private readonly ticketsService: TicketsService,
  ) {}

  /**
   *
   * @returns all user in database || required admin role
   */
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) //Routes réservés à un admin
  @Get('dash')
  @UseGuards(JwtAuthViewGuard)
  @Render('admin/dashbordadmin')
  async findAll(@Req() req: Request) {
    const users = await this.usersService.findAll();
    const events = await this.eventsService.findAll();
    const totalUsers = (await this.usersService.findAll()).length;
    const totalEvents = (await this.eventsService.findAll()).length;
    const totalGroups = (await this.groupesService.findAll()).length;
    const totalTickets = (await this.ticketsService.findAll()).length;
    const userCookie = req.cookies?.user;
    const user = userCookie ? JSON.parse(userCookie) : null;
    return {
      users,
      events,
      totalUsers,
      totalEvents,
      totalGroups,
      totalTickets,
      user,
    };
  }

  /**
   *
   * @returns Total number of user in database
   */
  //@UseGuards(RolesGuard)
  //@Roles(Role.ADMIN) //Routes réservés à un admin
  // @Get()
  // async NumberOfUser(@Req() req: Request) {
  //   //const userId = req.user.id;
  //   const userCookie = req.cookies?.user;
  //   const user = userCookie ? JSON.parse(userCookie) : null;
  //   const totalUsers = (await this.usersService.findAll()).length;
  //   const totalEvents = (await this.eventsService.findAll()).length;
  //   const totalGroups = (await this.groupesService.findAll()).length;

  //   //return (await this.usersService.findAll()).length;
  //   console.log(totalUsers, totalEvents);
  //   return {
  //     user,
  //     totalUsers,
  //     totalEvents,
  //     //totalGroups,
  //   };
  // }
  /**
   *
   * @param id string
   * @param user object
   * @returns user correspond with param id
   */
  // @UseGuards(OwnerGuard)
  @Get(':id/dashuser')
  @Render('Userpages/dashuser')
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    const users = await this.usersService.findOne(id);
    const groupesfavories = await this.usersService.getTotalfavoritesGroups(id);
    const ticketsByUsers = await this.ticketsService.findUserTickets(id);
    const seelater = await this.usersService.getUserSavedEvents(id);
    //console.log(seelater);
    return {
      users,
      groups: groupesfavories.groups,
      total: groupesfavories.total,
      ticketsByUsers,
      seelater,
    };
  }

  /**
   *
   * @param createUserDto Object user validated
   * @returns create and return new user || required admin role
   */
  @UseGuards(RolesGuard)
  @Roles(Role.ADMIN) //Routes réservés à un admin
  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  /**
   *
   * @param id string
   * @param updateUserDto object value validated
   * @param user object
   * @returns update information of user and return him
   */
  @UseGuards(OwnerGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return await this.usersService.update(id, updateUserDto);
  }

  /**
   *
   * @param id string
   * @param user object
   * @returns delete user and return message
   */
  @UseGuards(OwnerGuard)
  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    if (id === user.id) {
      throw new ForbiddenException("You can't delete yourself");
    }
    return await this.usersService.remove(id);
  }

  /**
   *
   * @param userId string
   * @param groupIds array
   * @returns add one groups on favorites liste and return all groups in favorit list
   */
  @UseGuards(OwnerGuard)
  @Post(':id/groupes')
  async addGroups(
    @Param('id') userId: string,
    @Body('groupIds') groupIds: string | string[],
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const groupIdsArray = Array.isArray(groupIds) ? groupIds : [groupIds];

      if (!groupIdsArray || groupIdsArray.length === 0) {
        throw new BadRequestException('No groups provided');
      }

      // Check if group is already in favorites
      const existingFavorites =
        await this.usersService.getTotalfavoritesGroups(userId);
      const alreadyFavorite = existingFavorites.groups.some((g) =>
        groupIdsArray.includes(g.groupeId),
      );

      if (!alreadyFavorite) {
        await this.usersService.addGroupsToUser(userId, groupIdsArray);
      }

      // Get the referer (previous page) to redirect back
      const referer = req.get('Referer') || `/users/${userId}/dashuser`;

      return res.redirect(referer);
    } catch (error) {
      console.error('Error adding group to favorites:', error);

      // Redirect to dashboard in case of error
      return res.redirect(`/users/${userId}/dashuser`);
    }
  }

  /**
   *
   * @param userId string
   * @returns total groups favorites of users
   */
  @UseGuards(OwnerGuard)
  @Get(':id/groupes')
  async getTotalFavoriteGroups(@Param('id') userId: string) {
    return await this.usersService.getTotalfavoritesGroups(userId);
  }

  /**
   *
   * @param id string
   * @returns array that contains all groups associate with this user
   */
  @UseGuards(OwnerGuard)
  @Get(':id/detail')
  async getUserWithGroups(@Param('id') id: string) {
    return await this.usersService.findUserWithGroups(id);
  }

  /**
   *
   * @param id string
   * @returns number of events reserved by user
   */
  @UseGuards(OwnerGuard)
  @Get(':id/events')
  async getAllEventsUser(@Param('id') id: string) {
    return await this.usersService.getDistinctEventCount(id);
  }

  /**
   *
   * @param id string
   * @returns all events saved by user in array
   */
  @UseGuards(OwnerGuard)
  @Get(':id/events_seeLater')
  async getSaved(@Param('id') id: string) {
    return await this.usersService.getUserSavedEvents(id);
  }

  /**
   *
   * @param id string
   * @returns return number of events saved by user
   */
  @UseGuards(OwnerGuard)
  @Get(':id/events_seeLater/count')
  async getNumberEvent(@Param('id') id: string) {
    return await this.usersService.getNumberOfEventSaved(id);
  }
}
