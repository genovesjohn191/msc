import {
  Directive,
  OnInit,
  Input,
  Renderer2,
  ElementRef
} from '@angular/core';

@Directive({
  selector: '[mcsContextualHelp]',
  host: {
    '(focusout)': 'focusOut()',
    '(focusin)': 'focusIn()'
  }
})

export class ContextualHelpDirective implements OnInit {
  public refreshFunc: () => void;

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
    if (this._hasFocus !== value) {
      this._hasFocus = value;
      if (this.refreshFunc) {
        this.refreshFunc();
      }
    }
  }

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.mcsContextualHelp = '';
  }

  public ngOnInit() {
    this._setTabIndex();
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
  public isVisible(): boolean {
    return this._elementRef.nativeElement.offsetParent !== null;
  }

  /**
   * This will hide the contextual help when new focus is set to other elements
   */
  public focusOut(): void {
    this.hasFocus = false;
  }

  /**
   * Show the contextual of the host element
   */
  public focusIn(): void {
    this.hasFocus = true;
  }

  /**
   * Set the tab index of the host element
   *
   * `@Note:` This is necessary in order for us to enable the focus for div elements
   */
  private _setTabIndex(): void {
    this._renderer.setAttribute(this._elementRef.nativeElement, 'tabindex', '0');
    this._renderer.addClass(this._elementRef.nativeElement, 'outline-none');
  }
}
