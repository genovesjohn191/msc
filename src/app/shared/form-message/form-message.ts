export interface FormMessage {
  showMessage(...messages: string[]): void;
  hideMessage(): void;
}
