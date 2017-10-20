import { ElementRef } from '@angular/core';
import { Observable } from 'rxjs/Rx';

export interface McsScrollable {
  getElementRef(): ElementRef;
  elementScrolled(): Observable<any>;
}
