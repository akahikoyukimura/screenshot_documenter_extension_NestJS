import { Injectable, NotFoundException } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { randomBytes } from 'crypto';
import { DocumentsService } from 'src/documents/documents.service';

export interface ScreenshotEntry {
  id: string;
  comment: string;
  imagePath: string;
  createdAt: string;
}

export interface Topic {
  id: string;
  name: string;
  documentPath: string;
  createdAt: string;
  screenshotCount: number;
  entries: ScreenshotEntry[];
}

interface Database {
  currentTopicId: string | null;
  topics: Topic[];
}

@Injectable()
export class TopicsService {
  // process.cwd() = C:\Projects\screenshot-documenter\backend
  // path.join (combines paths correctly) = C:\Projects\screenshot-documenter\backend\data 
  private readonly dataDirectory = path.join(process.cwd(), 'data');
  private readonly documentsDirectory = path.join(
    this.dataDirectory,
    'documents',
  );

  private readonly databasePath = path.join(
    this.dataDirectory,
    'topics.json',
  );

  constructor(private readonly documentsService: DocumentsService,) {
    this.initializeStorage();
  }

  private initializeStorage() {
    // The Sync means Node.js waits until the folder creation is finished before continuing to the next line.
    fs.mkdirSync(this.documentsDirectory, {
      recursive: true,
    });

    if (!fs.existsSync(this.databasePath)) {
      const database: Database = {
        currentTopicId: null,
        topics: [],
      };

      // fs.writeFileSync(filePath, content); (where? , what?)
      fs.writeFileSync(
        this.databasePath,
        JSON.stringify(database, null, 2), // JSON.stringify(value,replacer,space)
      );
    }
  }

  private readDatabase(): Database {
    const content = fs.readFileSync(
      this.databasePath,
      'utf-8',
    );

    return JSON.parse(content);
  }

  private writeDatabase(database: Database) {
    fs.writeFileSync(
      this.databasePath,
      JSON.stringify(database, null, 2),
    );
  }

  private generateId(): string {
    return randomBytes(4).toString('hex');
  }

  private sanitizeFileName(name: string): string {
    return name
      .normalize('NFD') // This separates letters from their accents
      .replace(/[\u0300-\u036f]/g, '') // This removes the accent characters "Café" -> "Cafe"
      .replace(/[^a-zA-Z0-9-_ ]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  createTopic(name: string): Topic {
    const database = this.readDatabase();

    const id = this.generateId();

    const safeName =
      this.sanitizeFileName(name) || `topic-${id}`;

    const topicDirectory = path.join(
      this.documentsDirectory,
      id,
    );

    fs.mkdirSync(topicDirectory, {
      recursive: true,
    });

    const topic: Topic = {
      id,
      name,
      documentPath: path.join(
        topicDirectory,
        `${safeName}.docx`,
      ),
      createdAt: new Date().toISOString(),
      screenshotCount: 0,
      entries: [],
    };

    database.topics.push(topic);

    database.currentTopicId = id;

    this.writeDatabase(database);

    return topic;
  }

  getCurrentTopic(): Topic | null {
    const database = this.readDatabase();

    if (!database.currentTopicId) {
      return null;
    }

    return (
      database.topics.find(
        topic => topic.id === database.currentTopicId,
      ) || null
    );
  }

  getTopics(): Topic[] {
    const database = this.readDatabase();

    return database.topics;
  }

  setCurrentTopic(id: string): Topic {
    const database = this.readDatabase();

    const topic = database.topics.find(
      item => item.id === id,
    );

    if (!topic) {
      throw new NotFoundException('Topic not found');
    }

    database.currentTopicId = id;

    this.writeDatabase(database);

    return topic;
  }

  async addScreenshot(
  topicId: string,
  imageBuffer: Buffer,
  comment: string,
): Promise<ScreenshotEntry> {
  const database = this.readDatabase();

  const topic = database.topics.find(
    item => item.id === topicId,
  );

  if (!topic) {
    throw new NotFoundException(
      'Topic not found',
    );
  }

  const entryId = this.generateId();

  const topicDirectory = path.dirname(
    topic.documentPath,
  );

  fs.mkdirSync(topicDirectory, {
    recursive: true,
  });

  const imagePath = path.join(
    topicDirectory,
    `${entryId}.png`,
  );

  fs.writeFileSync(
    imagePath,
    imageBuffer,
  );

  const entry: ScreenshotEntry = {
    id: entryId,
    comment,
    imagePath,
    createdAt: new Date().toISOString(),
  };

  topic.entries.push(entry);

  topic.screenshotCount =
    topic.entries.length;

  this.writeDatabase(database);

  await this.documentsService.generateDocument(
    topic,
  );

  return entry;
}
}