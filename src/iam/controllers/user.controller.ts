import {
  Controller,
  Get,
  Param,
  Patch,
  Delete,
  Body,
  Request,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { UserService } from '../services/user.service';
import { Roles } from '../decorators/roles.decorator';

@ApiTags('Users')
@Controller('users')
export class UserController {
  constructor(private readonly usersService: UserService) { }

  // Get user by ID (protected by default via JwtAuthGuard globally)
  @Roles('admin')
  @ApiBearerAuth("jwt")
  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.usersService.findOneById(id);
  }

  // Update user by ID (admin or self)
  @Patch(':id')
  update(@Param('id') id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // Soft delete user by ID (admin only — add RolesGuard later if needed)
  @Delete(':id')
  remove(@Param('id') id: number) {
    return this.usersService.softDelete(id);
  }

  // Logged-in user can update their own profile
  @Patch('profile')
  updateProfile(@Request() req, @Body() dto: UpdateUserDto) {
    return this.usersService.update(req.user.id, dto);
  }
}
