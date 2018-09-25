import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs';

export interface Scrollable {
  scrollbarId: string;
  getElementRef(): ElementRef;
  elementScrolled(): Observable<any>;
}
