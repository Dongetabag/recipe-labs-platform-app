// Recipe Labs Media Agent Types

export interface MediaProductType {
  id: string;
  name: string;
  icon: string;
  description: string;
  basePrompt: string;
  aspectRatio: "1:1" | "3:4" | "4:3" | "9:16" | "16:9";
}

export enum MediaAppStatus {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR'
}

export interface MediaChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface MediaDesignSpec {
  location?: string;
  date?: string;
  includeDate?: boolean;
  eventTitle?: string;
  colorPalette?: string;
  vibe?: string;
  additionalNotes?: string;
  fontFamily?: string;
  fontWeight?: string;
  letterSpacing?: string;
}

export interface MediaBatchItem {
  id: string;
  sourceUrl: string;
  resultUrl: string | null;
  status: MediaAppStatus;
  error: string | null;
  targetProductId: string | null;
  targetProductName: string | null;
  individualItemContext?: string;
  isRemixing?: boolean;
}


