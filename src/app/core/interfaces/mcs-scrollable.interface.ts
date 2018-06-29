import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs';

export interface McsScrollable {
  scrollbarId: string;
  getElementRef(): ElementRef;
  elementScrolled(): Observable<any>;
}
