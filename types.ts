export enum MessageAuthor {
  USER = 'user',
  MODEL = 'model',
  SYSTEM = 'system',
}

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
}
