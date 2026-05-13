import 'dotenv/config';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

// Create a PostgreSQL connection pool
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

type ExtendedPrismaClient = ReturnType<typeof prismaClientSingleton>;

@Injectable()
export class PrismaService implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private client: ExtendedPrismaClient;

  constructor() {
    this.client = prismaClientSingleton();
  }

  // Expose all Prisma model accessors by proxying through the extended client
  get internship() { return this.client.internship; }
  get diaryEntry()  { return this.client.diaryEntry; }
  get report()      { return this.client.report; }
  get user()        { return this.client.user; }
  get notification(){ return this.client.notification; }

  // Expose raw client methods needed by NestJS lifecycle
  async $connect()    { return this.client.$connect(); }
  async $disconnect() { return this.client.$disconnect(); }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('✅ Database connected');
    } catch (error) {
      this.logger.error('❌ Database connection failed — API will start but DB calls will fail:', (error as Error).message);
    }
  }
}
