import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';

export interface McsScrollable {
  scrollbarId: string;
  getElementRef(): ElementRef;
  elementScrolled(): Observable<any>;
}
