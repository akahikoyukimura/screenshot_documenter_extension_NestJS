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