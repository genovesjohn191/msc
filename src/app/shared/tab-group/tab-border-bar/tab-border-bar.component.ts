import {
  Component,
  Renderer2,
  ElementRef,
  NgZone,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
} from '@angular/core';

@Component({
  selector: 'mcs-tab-border-bar',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'tab-border-bar-wrapper'
  }
})

export class TabBorderBarComponent {

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _ngZone: NgZone
  ) { }

  /**
   * Align the bar on the specified element to execute the transition within its element
   * @param element Element to get the style with
   */
  public alignToElement(element: HTMLElement) {
    if (typeof requestAnimationFrame !== 'undefined') {
      this._ngZone.runOutsideAngular(() => {
        requestAnimationFrame(() => this._setStyles(element));
      });
    } else {
      this._setStyles(element);
    }
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set the styles of the bar based on the element provided
   * @param element Element to be the basis of the style
   */
  private _setStyles(element: HTMLElement) {
    const left = element ? (element.offsetLeft || 0) + 'px' : '0';
    const width = element ? (element.offsetWidth || 0) + 'px' : '0';

    this._renderer.setStyle(this._elementRef.nativeElement, 'left', left);
    this._renderer.setStyle(this._elementRef.nativeElement, 'width', width);
  }
}
