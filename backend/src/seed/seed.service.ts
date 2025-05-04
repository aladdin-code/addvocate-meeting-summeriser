import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExchangeService } from '../exchange/exchange.service';
import { AuthService } from '../auth/auth.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    private readonly prisma: PrismaService,
    private readonly exchangeService: ExchangeService,
    private readonly authService: AuthService,
  ) {}

  async onModuleInit() {
    // Seed default user
    await this.seedDefaultUser();

    // Seed default exchange
    await this.seedDefaultExchange();
  }

  async seedDefaultUser() {
    const userCount = await this.prisma.user.count();

    if (userCount === 0) {
      Logger.log('No users found. Seeding default user...', 'SeedService');

      try {
        // Use authService instead of direct prisma access
        await this.authService.signUp({
          email: 'admin@addvocate.ai',
          password: 'admin123',
          name: 'Addvocatee Admin',
        });

        Logger.log('Default user seeded successfully!', 'SeedService');
      } catch (error) {
        Logger.error(
          `Failed to seed default user: ${error.message}`,
          'SeedService',
        );
      }
    } else {
      Logger.log('Users already exist. Skipping user seed.', 'SeedService');
    }
  }

  async seedDefaultExchange() {
    const exchangeCount = await this.prisma.exchange.count();

    if (exchangeCount === 0) {
      Logger.log(
        'No exchanges found. Seeding default exchange...',
        'SeedService',
      );

      const filePath = path.join(__dirname, './exchange1.json');
      const file = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(file);
      console.log(data);

      // Transform the data structure to match what exchange.service.create expects
      const transformedMessages = data.map((message) => {
        // Join all words to create the text
        const text = message.words.map((word) => word.text).join('');

        return {
          text: text,
          speaker: message.speaker,
          speakerId: message.speaker_id,
        };
      });

      // Use transformedMessages instead of data
      await this.exchangeService.create('First Exchange.', transformedMessages);
      Logger.log('Default exchange seeded successfully!', 'SeedService');
    } else {
      Logger.log(
        'Exchanges already exist. Skipping exchange seed.',
        'SeedService',
      );
    }
  }
}
