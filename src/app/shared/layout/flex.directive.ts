import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  OnInit
} from '@angular/core';

type FlexType = 'auto' | 'none';

@Directive({
  selector: '[flex]'
})

export class FlexDirective implements OnInit {

  /**
   * Set the flex type to the host element
   */
  @Input('flex')
  public get flexType(): FlexType {
    return this._flexType;
  }
  public set flexType(value: FlexType) {
    if (value && this._flexType !== value) {
      this._flexType = value;
    }
  }
  private _flexType: FlexType;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.flexType = 'none';
  }

  public ngOnInit() {
    this._renderer.addClass(this._elementRef.nativeElement, `flex-${this.flexType}`);
  }
}
