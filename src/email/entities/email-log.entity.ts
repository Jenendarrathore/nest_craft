// src/email/entities/email-log.entity.ts

import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('email_logs')
export class EmailLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  to: string;

  @Column()
  subject: string;

  @Column()
  type: string; // previously EmailType enum

  @Column({ default: 'PENDING' })
  status: string; // previously EmailStatus enum

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: 'jsonb', nullable: true })
  context: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  error: string;

  @Column({ nullable: true })
  correlationId: string;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date | null;

  @Column({ nullable: true })
  providerResponseId: string;

  @Column({ type: 'text', nullable: true })
  retryReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
