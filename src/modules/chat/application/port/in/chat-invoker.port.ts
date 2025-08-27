export abstract class ChatInvoker {
  abstract deleteMessage(messageId: string): Promise<void>;
}
