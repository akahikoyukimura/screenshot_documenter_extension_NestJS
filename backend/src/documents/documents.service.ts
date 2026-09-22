import { Injectable } from '@nestjs/common';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
} from 'docx';

import * as fs from 'fs';
import * as path from 'path';

import { Topic } from '../topics/topics.service';

@Injectable()
export class DocumentsService {
  async generateDocument(topic: Topic): Promise<void> {
    const children: Paragraph[] = [];

    children.push(
      new Paragraph({
        text: topic.name,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
      }),
    );

    // children.push(
    //   new Paragraph({
    //     children: [
    //       new TextRun({
    //         text: `Created: ${this.formatDate(
    //           topic.createdAt,
    //         )}`,
    //       }),
    //     ],
    //   }),
    // );

    children.push(
      new Paragraph({
        text: '',
      }),
    );

    topic.entries.forEach((entry, index) => {
      // children.push(
      //   new Paragraph({
      //     text: `Screenshot ${index + 1}`,
      //     heading: HeadingLevel.HEADING_1,
      //   }),
      // );

      // children.push(
      //   new Paragraph({
      //     children: [
      //       new TextRun({
      //         text: this.formatDate(
      //           entry.createdAt,
      //         ),
      //         bold: true,
      //       }),
      //     ],
      //   }),
      // );

      // children.push(
      //   new Paragraph({
      //     text: '',
      //   }),
      // );

      if (fs.existsSync(entry.imagePath)) {
        const imageBuffer = fs.readFileSync(
          entry.imagePath,
        );

        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                type: 'png',
                data: imageBuffer,
                transformation: {
                  width: 600,
                  height: 300,
                },
              }),
            ],
          }),
        );
      }

      // children.push(
      //   new Paragraph({
      //     children: [
      //       new TextRun({
      //         text: 'Comment',
      //         bold: true,
      //       }),
      //     ],
      //   }),
      // );

      children.push(
        new Paragraph({
          text: entry.comment,
        }),
      );

      children.push(
        new Paragraph({
          text: '',
        }),
      );
    });

    const document = new Document({
      sections: [
        {
          properties: {},
          children,
        },
      ],
    });

    const buffer =
      await Packer.toBuffer(document);

    fs.writeFileSync(
      topic.documentPath,
      buffer,
    );
  }

  private formatDate(date: string): string {
    return new Intl.DateTimeFormat(
      'en-GB',
      {
        dateStyle: 'medium',
        timeStyle: 'short',
      },
    ).format(new Date(date));
  }
}