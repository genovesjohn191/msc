import { Injector } from '@angular/core';

export interface IOrderEventStrategy {
  setInjector(injector: Injector): void;
  executeEvent(): void;
}
