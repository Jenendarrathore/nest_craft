// roles/entities/role.entity.ts
import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToMany } from 'typeorm';
import { User } from './user.entity';

@Entity('roles')
export class Role {
    @PrimaryGeneratedColumn({ type: 'integer' })
    id: number

    @Column({ unique: true })
    name: string; // e.g., 'admin', 'user', 'sub-admin'

    @Column({ nullable: true })
    description: string; // e.g., 'admin', 'user', 'sub-admin'

    @ManyToMany(() => User, (user) => user.roles)
    users: User[];
}
