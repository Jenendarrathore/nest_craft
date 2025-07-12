import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { Repository } from 'typeorm';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { CommonService } from 'src/common/services/common.service';
import { BaseHelperService } from 'src/common/services/base-helper.service';

@Injectable()
export class UserService extends CommonService<User> {
  constructor(
    @InjectRepository(User)
    readonly repo: Repository<User>,
    readonly helper: BaseHelperService,
  ) {
    super(repo, helper); // pass both to the base constructor
  }


  async isEmailTaken(email: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { email } });
    return !!user;
  }

  async isUsernameTaken(username: string): Promise<boolean> {
    const user = await this.repo.findOne({ where: { username } });
    return !!user;
  }

  async findByEmailOrUsername(identifier: string) {
    return this.repo.findOne({
      where: [
        { email: identifier },
        { username: identifier },
      ],
      relations: ['roles'], // Load roles for permission/auth purposes
    });
  }


  async create(data: Partial<User>) {
    const user = this.repo.create(data);
    return this.repo.save(user);
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async update(id: number, dto: UpdateUserDto): Promise<User> {
    await this.repo.update({ id }, dto);
    return this.findOneById(id);
  }

  async softDelete(id: number): Promise<{ message: string }> {
    await this.repo.softDelete(id);
    return { message: 'User soft-deleted successfully' };
  }



}
