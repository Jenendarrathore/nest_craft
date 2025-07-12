import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Request,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserService } from '../services/user.service';
import { Roles } from '../decorators/roles.decorator';
import { BasicFilterQueryDto } from 'src/common/query/dtos/basic-filter-query.dto';
import { Public } from '../decorators/public.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Public()
  @Get()
  async findAll(@Query() query: BasicFilterQueryDto) {
    return this.userService.find(query);
  }


  // Get user by ID (protected by default via JwtAuthGuard globally)
  @Roles('admin')
  @ApiBearerAuth("jwt")
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.userService.findOneById(id);
  }

  // Update user by ID (admin or self)
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.userService.update(id, dto);
  }

  // Soft delete user by ID (admin only — add RolesGuard later if needed)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.userService.softDelete(id);
  }

  // Logged-in user can update their own profile
  @Patch('profile')
  updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.userService.update(req.user.id, dto);
  }
}
