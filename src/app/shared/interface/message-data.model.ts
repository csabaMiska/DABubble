import { Mention } from './mention.model';

export interface MessageData {
  text: string;
  mentions: Mention[];
}