import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../entities/role.entity';
import { Repository } from 'typeorm';
import { CreateRoleDto } from '../dtos/create-role.dto';

@Injectable()
export class RoleService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
    ) { }

    async create(dto: CreateRoleDto) {
        const role = this.roleRepo.create(dto);
        return this.roleRepo.save(role);
    }

    async findAll() {
        return this.roleRepo.find();
    }

    async findOne(id: number) {
        const role = await this.roleRepo.findOne({ where: { id } });
        if (!role) throw new NotFoundException('Role not found');
        return role;
    }

    async findByName(name: string) {
        return this.roleRepo.findOne({ where: { name } });
    }


    async remove(id: number) {
        const role = await this.findOne(id);
        return this.roleRepo.remove(role);
    }
}
