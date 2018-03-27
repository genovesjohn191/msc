import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  OnInit
} from '@angular/core';
import { coerceBoolean } from '../../utilities';

@Directive({
  selector: '[cursor]'
})

export class CursorDirective implements OnInit {
  /**
   * Set the cursor type to the host element
   */
  @Input()
  public get cursor(): string { return this._cursor; }
  public set cursor(value: string) {
    if (this._cursor !== value) { this._cursor = value; }
  }
  private _cursor: string;

  /**
   * Flag that determine when the cursor would be displayed
   */
  @Input()
  public get triggerCursorIf(): boolean { return this._triggerCursorIf; }
  public set triggerCursorIf(value: boolean) {
    if (value !== this._triggerCursorIf) { this._triggerCursorIf = coerceBoolean(value); }
  }
  private _triggerCursorIf: boolean = true;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.cursor = 'auto';
  }

  public ngOnInit() {
    this.triggerCursorIf ? this._setStyledCursor() : this._setDefaultCursor();
  }

  /**
   * Sets the default cursor arrow head
   */
  private _setDefaultCursor(): void {
    this._renderer.removeStyle(this._elementRef.nativeElement, 'cursor');
  }

  /**
   * Sets the styled cursor
   */
  private _setStyledCursor(): void {
    this._renderer.setStyle(this._elementRef.nativeElement, 'cursor', this.cursor);
  }
}
