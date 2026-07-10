import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import 'dotenv/config';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../generated/prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly configuredPoolLimit: number;
  private readonly configuredMinimumIdle: number;

  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is required to initialize PrismaService.');
    }

    const configuredPoolLimit = Number(process.env.DB_POOL_LIMIT ?? 10);
    const configuredMinimumIdle = Number(process.env.DB_POOL_MIN_IDLE ?? 2);

    super({
      adapter: new PrismaMariaDb({
        host: process.env.DATABASE_HOST,
        port: Number(process.env.DATABASE_PORT),
        user: process.env.DATABASE_USER,
        password: process.env.DATABASE_PASSWORD,
        database: process.env.DATABASE_NAME,
        connectionLimit: Number(process.env.DB_POOL_LIMIT ?? 10),
        minimumIdle: Number(process.env.DB_POOL_MIN_IDLE ?? 2),
        acquireTimeout: Number(process.env.DB_POOL_ACQUIRE_TIMEOUT_MS ?? 10_000),
        idleTimeout: Number(process.env.DB_POOL_IDLE_TIMEOUT_SEC ?? 60),
      }),
    });

    this.configuredPoolLimit = configuredPoolLimit;
    this.configuredMinimumIdle = configuredMinimumIdle;
  }

  async getPoolStatus() {
    const threadsConnected = await this.$queryRawUnsafe<Array<{ Value: string }>>(
      "SHOW STATUS LIKE 'Threads_connected'",
    );

    const appSessions = await this.$queryRawUnsafe<Array<{ count: bigint | number }>>(
      `SELECT COUNT(*) AS count
       FROM information_schema.PROCESSLIST
       WHERE USER = ? AND DB = ?`,
      process.env.DATABASE_USER,
      process.env.DATABASE_NAME,
    );

    return {
      configured: {
        connectionLimit: this.configuredPoolLimit,
        minimumIdle: this.configuredMinimumIdle,
      },
      realtime: {
        threadsConnected: Number(threadsConnected[0]?.Value ?? 0),
        appSessions: Number(appSessions[0]?.count ?? 0),
      },
      timestamp: new Date().toISOString(),
    };
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}