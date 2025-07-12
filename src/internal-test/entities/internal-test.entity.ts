// src/internal-test/entities/internal-test.entity.ts

import { CommonEntity } from 'src/common/base/common.entity';
import { User } from 'src/iam/entities/user.entity';
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';

export enum Status {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  DRAFT = 'draft',
}

@Entity('internal_test')
export class InternalTestEntity extends CommonEntity {

  @Column()
  name: string;

  @Column({ nullable: true })
  email: string;

  @Column({ nullable: true })
  age: number;

  @Column({ name: 'is_active', nullable: true })
  isActive: boolean;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;


  @Column({ type: 'text', nullable: true })
  bio: string;

}
