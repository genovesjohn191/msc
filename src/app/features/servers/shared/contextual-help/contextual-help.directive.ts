import {
  Directive,
  Input,
  ElementRef,
  HostListener
} from '@angular/core';

@Directive({
  selector: '[mcsContextualHelp]'
})

export class ContextualHelpDirective {
  @Input()
  public mcsContextualHelp: string;

  /**
   * Focus flag that determines weather the directive has received focus,
   * and that corresponding styling for the contextual help should be applied
   */
  private _hasFocus: boolean;
  public get hasFocus(): boolean {
    return this._hasFocus;
  }
  public set hasFocus(value: boolean) {
    this._hasFocus = value;
  }

  constructor(private _elementRef: ElementRef) {
    this.mcsContextualHelp = '';
  }

  /**
   * Get the host element reference which serves as the
   * attachment of the contextual help
   *
   * `@Note` This position of these should be static
   * so that it will get the actual direction
   */
  public getHostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  /**
   * Get the contextual help given on the directive element
   */
  public getContextualHelp(): string {
    return this.mcsContextualHelp;
  }

  /**
   * Visibility flag to check if the context should be dispayed or not
   * according with its parent element, if the parent element is not display
   * then the contextual help should not be display also
   */
  public get isVisible(): boolean {
    return this._elementRef.nativeElement.offsetParent !== null;
  }

  @HostListener('focusin')
  @HostListener('mouseenter')
  private _onMouseEnter(): void {
    this._hasFocus = true;
  }

  @HostListener('focusout')
  @HostListener('mouseleave')
  private _onMouseLeave(): void {
    this._hasFocus = false;
  }
}
