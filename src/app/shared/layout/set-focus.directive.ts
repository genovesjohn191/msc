import {
  Directive,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import { refreshView } from '@app/utilities';
import { CoreDefinition } from '@app/core';

@Directive({
  selector: '[set-focus]'
})

export class SetFocusDirective implements AfterViewInit {

  constructor(private _elementRef: ElementRef) { }

  public ngAfterViewInit() {
    // Set focus to element
    refreshView(() => {
      this._elementRef.nativeElement.focus();
    }, CoreDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
