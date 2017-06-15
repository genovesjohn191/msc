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
   * Focus flag that determines weather the directive has received focus
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

  public getElementReference(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  public getContextualHelp(): string {
    return this.mcsContextualHelp;
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
