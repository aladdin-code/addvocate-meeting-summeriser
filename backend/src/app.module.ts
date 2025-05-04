import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { GptModule } from './gpt/gpt.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';
import { ExchangeModule } from './exchange/exchange.module';
import { SummaryModule } from './summary/summary.module';
import { SeedService } from './seed/seed.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ExchangeModule,
    SummaryModule,
    GptModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
