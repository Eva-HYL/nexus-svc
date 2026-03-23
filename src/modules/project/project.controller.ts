import { Controller, Get, Post, Put, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProjectService } from './project.service';

@Controller('project')
@UseGuards(AuthGuard('jwt'))
export class ProjectController {
  constructor(private projectService: ProjectService) {}

  @Get('list')
  findAll(@Query('clubId') clubId: string) {
    return this.projectService.findAll(BigInt(clubId));
  }

  @Post('add')
  create(@Body() body: any) {
    const { clubId, ...data } = body;
    return this.projectService.create(BigInt(clubId), data);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.projectService.update(BigInt(id), body);
  }
}
