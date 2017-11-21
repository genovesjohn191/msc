import {
  Directive,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { refreshView } from '../../utilities';

@Directive({
  selector: '[set-focus]'
})

export class SetFocusDirective implements AfterViewInit {

  constructor(private _elementRef: ElementRef) { }

  public ngAfterViewInit() {
    // Set focus to element
    refreshView(() => {
      this._elementRef.nativeElement.focus();
    });
  }
}
