import {
  Directive,
  ElementRef
} from '@angular/core';

@Directive({
  selector: '[mcsSelectItemLabel]',
})
export class SelectItemLabelDirective {

  constructor(private _elementRef: ElementRef) {
  }

  /**
   * Returns the view value of the item label
   */
  public get viewValue(): string {
    return (this._elementRef.nativeElement.textContent || '').trim();
  }
}
