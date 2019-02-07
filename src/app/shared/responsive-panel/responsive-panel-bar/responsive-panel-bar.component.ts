import {
  Component,
  Renderer2,
  ElementRef,
  NgZone,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'mcs-responsive-panel-bar',
  template: `<ng-content></ng-content>`,
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'responsive-panel-bar-wrapper'
  }
})

export class ResponsivePanelBarComponent {

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _ngZone: NgZone
  ) { }

  /**
   * Align the bar on the specified element to execute the transition within its element
   * @param element Element where the border will be align
   */
  public alignToElement(element: HTMLElement) {
    this._ngZone.runOutsideAngular(() => {
      typeof requestAnimationFrame !== 'undefined' ?
        requestAnimationFrame(() => this._setStyles(element)) :
        setTimeout(() => this._setStyles(element));
    });
  }

  /**
   * Set the styles of the bar based on the element provided
   * @param element Element to be the basis of the style
   */
  private _setStyles(element: HTMLElement) {
    let left = element ? (element.offsetLeft || 0) + 'px' : '0';
    let width = element ? (element.offsetWidth || 0) + 'px' : '0';
    this._renderer.setStyle(this._elementRef.nativeElement, 'left', left);
    this._renderer.setStyle(this._elementRef.nativeElement, 'width', width);
  }
}
