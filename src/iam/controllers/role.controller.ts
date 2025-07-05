import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { CreateRoleDto } from '../dtos/create-role.dto';
import { RoleService } from '../services/role.service';
import { Public } from '../decorators/public.decorator';

@ApiTags('Roles')
@ApiBearerAuth('jwt')
@Controller('roles')
export class RoleController {
  constructor(private readonly rolesService: RoleService) {}

  @Public()
  @Post()
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Get()
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.findOne(id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.rolesService.remove(id);
  }
}
