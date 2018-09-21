import {
  Component,
  OnInit,
  ElementRef,
  Renderer2,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

// The styling of this component is under the shared scss (classes).
// The reason why the styling is under common because the directive element
// cannot recognize the implemented style in this component unless it is not used
@Component({
  selector: 'mcs-ripple',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'ripple-wrapper'
  }
})

export class RippleComponent implements OnInit {

  constructor(
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) { }

  public ngOnInit(): void {
    this._setRelativeToParent();
  }

  /**
   * This will enforce the parent element to be relative
   */
  private _setRelativeToParent(): void {
    if (isNullOrEmpty(this._elementRef)) { return; }
    let parentElement = this._elementRef.nativeElement.parentElement;

    if (!isNullOrEmpty(parentElement)) {
      this._renderer.setStyle(parentElement, 'position', 'relative');
    }
  }
}
