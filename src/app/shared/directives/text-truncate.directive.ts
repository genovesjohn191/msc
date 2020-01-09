import {
  Directive,
  OnChanges,
  SimpleChanges,
  Input,
  Renderer2,
  ElementRef,
  HostBinding,
  AfterViewInit
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';

@Directive({
  selector: '[mcsTextTruncate]'
})
export class TextTruncateDirective implements OnChanges, AfterViewInit {

  @Input('mcsTextTruncate')
  public textTruncate: string;

  @Input('mcsTextTruncateSize')
  public textTruncateSize: string = '250px';

  @HostBinding('attr.text-ellipsis')
  public textEllipsis: boolean = true;

  constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) { }

  public ngAfterViewInit(): void {
    this._setTitle();
    this._setTextSize();
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let textContentChange = changes['textTruncate'];
    if (!isNullOrEmpty(textContentChange)) {
      this._setTitle();
    }

    let textSizeChange = changes['textTruncateSize'];
    if (!isNullOrEmpty(textSizeChange)) {
      this._setTextSize();
    }
  }

  /**
   * Sets the title for preview
   */
  private _setTitle(): void {
    this._renderer.setAttribute(this._elementRef.nativeElement, 'title', this.textTruncate);
  }

  /**
   * Sets the title for text size
   */
  private _setTextSize(): void {
    this._renderer.setStyle(this._elementRef.nativeElement, 'max-width', this.textTruncateSize);
  }
}
