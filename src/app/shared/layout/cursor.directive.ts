import {
  Directive,
  Input,
  Renderer2,
  ElementRef,
  OnInit
} from '@angular/core';

@Directive({
  selector: '[cursor]'
})

export class CursorDirective implements OnInit {
  /**
   * Set the cursor type to the host element
   */
  @Input()
  public get cursor(): string {
    return this._cursor;
  }
  public set cursor(value: string) {
    if (this._cursor !== value) {
      this._cursor = value;
    }
  }
  private _cursor: string;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.cursor = 'auto';
  }

  public ngOnInit() {
    this._renderer.setStyle(this._elementRef.nativeElement, 'cursor', this.cursor);
  }
}
