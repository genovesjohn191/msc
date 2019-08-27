import {
  Directive,
  ElementRef,
  AfterViewInit
} from '@angular/core';
import {
  refreshView,
  CommonDefinition
} from '@app/utilities';

@Directive({
  selector: '[mcsSetFocus]'
})

export class SetFocusDirective implements AfterViewInit {

  constructor(private _elementRef: ElementRef) { }

  public ngAfterViewInit() {
    // Set focus to element
    refreshView(() => {
      this._elementRef.nativeElement.focus();
    }, CommonDefinition.DEFAULT_VIEW_REFRESH_TIME);
  }
}
