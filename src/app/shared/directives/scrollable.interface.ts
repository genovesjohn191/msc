import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs';

export interface Scrollable {
  scrollbarId: string;
  getElementRef(): ElementRef<HTMLElement>;
  elementScrolled(): Observable<any>;
}
