export abstract class PubSubClient {
  abstract publish(channel: string, message: Record<string, unknown>): Promise<void>;
  abstract subscribe(
    channel: string,
    callback: (message: Record<string, unknown>) => Promise<void> | void
  ): Promise<void>;
  abstract unsubscribe(channel: string): Promise<void>;
}
