import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
// import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GroupesService } from './groupes.service';
import { CreateGroupeDto } from './dto/create-groupe.dto';
import { UpdateGroupeDto } from './dto/update-groupe.dto';

@Controller('groupes')
export class GroupesController {
  constructor(private readonly groupesService: GroupesService) {}

  @Post()
  create(@Body() createGroupeDto: CreateGroupeDto) {
    return this.groupesService.create(createGroupeDto);
  }

  @Get()
  findAll() {
    return this.groupesService.findAll();
  }

  @Get('/totalGroups')
  async getTotalGroups() {
    return (await this.findAll()).length;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.groupesService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGroupeDto: UpdateGroupeDto) {
    return this.groupesService.update(id, updateGroupeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.groupesService.remove(id);
  }
}
