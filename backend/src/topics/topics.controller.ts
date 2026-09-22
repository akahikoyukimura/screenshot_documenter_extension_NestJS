import { BadRequestException, Body, Controller, Get, Post } from '@nestjs/common';

import { TopicsService } from './topics.service';

import { DocumentsService } from '../documents/documents.service';

import { CreateTopicDto } from './dto/create-topic.dto';

@Controller('topics')
export class TopicsController {
  constructor(private readonly topicsService: TopicsService) {}

  @Post()
  createTopic(@Body() dto: CreateTopicDto) {
    return this.topicsService.createTopic(dto.name);
  }

  @Get()
  getTopics() {
    return this.topicsService.getTopics();
  }

  @Get('current')
  getCurrentTopic() {
    return this.topicsService.getCurrentTopic();
  }

  @Post('current')
  setCurrentTopic(@Body('id') id: string) {
    return this.topicsService.setCurrentTopic(id);
  }

  @Post('current/screenshots')
async addScreenshot(
  @Body('image') image: string,
  @Body('comment') comment: string,
) {
  const topic =
    this.topicsService.getCurrentTopic();

  if (!topic) {
    throw new BadRequestException(
      'No active topic',
    );
  }

  if (!image) {
    throw new BadRequestException(
      'Image is required',
    );
  }

  const base64 = image.replace(
    /^data:image\/\w+;base64,/,
    '',
  );

  const imageBuffer =
    Buffer.from(base64, 'base64');

  const entry =
    await this.topicsService.addScreenshot(
      topic.id,
      imageBuffer,
      comment || '',
    );

  return {
    success: true,
    topicId: topic.id,
    entry,
    screenshotCount:
      topic.screenshotCount,
  };
}
}
