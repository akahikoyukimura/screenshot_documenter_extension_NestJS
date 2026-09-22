import { Module } from '@nestjs/common';

import {
  TopicsController,
} from './topics.controller';

import {
  TopicsService,
} from './topics.service';

import {
  DocumentsModule,
} from '../documents/documents.module';

@Module({
  imports: [
    DocumentsModule,
  ],
  controllers: [
    TopicsController,
  ],
  providers: [
    TopicsService,
  ],
  exports: [
    TopicsService,
  ],
})
export class TopicsModule {}