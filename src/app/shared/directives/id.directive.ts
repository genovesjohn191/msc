import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import { isNullOrEmpty } from '@app/utilities';
import { McsUniqueId } from '@app/core';

@Directive({
  selector: '[mcsId]',
  host: {
    '[attr.id]': 'generatedId'
  }
})

export class IdDirective implements AfterViewInit, OnChanges {

  @Input('mcsId')
  public customId: string;

  private _generatedId: string;

  constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._generateUniqueId();
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let customIdHasChanged = changes['customId'];
    if (isNullOrEmpty(customIdHasChanged)) { return; }
    this._generateUniqueId();
  }

  /**
   * Returns the generated ID based on the text content of the element
   */
  public get generatedId(): string {
    return this._generatedId;
  }

  /**
   * Generates new unique hash id but the innertext will be remained for consistency
   */
  public generateNewHashId(): string {
    return isNullOrEmpty(this.customId) ?
      this._generateIdByTextContent() :
      this._generateIdByCustomInput();
  }

  /**
   * Returns the host text content with converted to dash
   */
  public get hostTextContent(): string {
    let textContent = (this._elementRef.nativeElement.textContent || '').trim();
    return textContent;
  }

  /**
   * Generates the id based on the host text content with hashing id key for uniqueness
   */
  private _generateIdByTextContent(): string {
    return McsUniqueId.NewId(this.hostTextContent);
  }

  /**
   * Generates the id based on the custom input with hashing id key for uniqueness
   */
  private _generateIdByCustomInput(): string {
    return McsUniqueId.NewId(this.customId);
  }

  /**
   * Sets the default settings based on criteria
   */
  private _generateUniqueId(): void {
    this._generatedId = isNullOrEmpty(this.customId) ?
      this._generateIdByTextContent() :
      this._generateIdByCustomInput();
    this._changeDetectorRef.markForCheck();
  }
}
