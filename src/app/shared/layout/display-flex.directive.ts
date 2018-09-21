import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  OnInit
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

type DisplayFlexType = 'row' | 'column';
type AlignmentFlexType = 'flex-start' | 'center' | 'flex-end' | 'none';

@Directive({
  selector: '[display-flex]'
})

export class DisplayFlexDirective implements OnInit {
  /**
   * Set the display-flex type to the host element
   */
  @Input('display-flex')
  public get displayFlexType(): DisplayFlexType {
    return this._displayFlexType;
  }
  public set displayFlexType(value: DisplayFlexType) {
    if (value && this._displayFlexType !== value) {
      this._displayFlexType = value;
    }
  }
  private _displayFlexType: DisplayFlexType;

  /**
   * Set the align-items type to the host element
   */
  @Input('align-items')
  public get alignItemsType(): AlignmentFlexType {
    return this._alignItemsType;
  }
  public set alignItemsType(value: AlignmentFlexType) {
    if (value && this._alignItemsType !== value) {
      this._alignItemsType = value;
    }
  }
  private _alignItemsType: AlignmentFlexType;

  /**
   * Set the justify-content type to the host element
   */
  @Input('justify-content')
  public get justifyContentType(): AlignmentFlexType {
    return this._justifyItemsType;
  }
  public set justifyContentType(value: AlignmentFlexType) {
    if (value && this._justifyItemsType !== value) {
      this._justifyItemsType = value;
    }
  }
  private _justifyItemsType: AlignmentFlexType;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.displayFlexType = 'row';
  }

  public ngOnInit() {
    this._renderer.addClass(this._elementRef.nativeElement,
      `display-flex-${this.displayFlexType}`);

    if (!isNullOrEmpty(this.alignItemsType)) {
      this._renderer.addClass(this._elementRef.nativeElement,
        `align-items-${this.alignItemsType}`);
    }
    if (!isNullOrEmpty(this.justifyContentType)) {
      this._renderer.addClass(this._elementRef.nativeElement,
        `justify-content-${this.justifyContentType}`);
    }
  }
}
