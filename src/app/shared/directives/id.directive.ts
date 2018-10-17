import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
  ChangeDetectorRef,
  OnChanges,
  SimpleChanges
} from '@angular/core';
import {
  isNullOrEmpty,
  convertSpacesToDash
} from '@app/utilities';
import Hashids from 'hashids';

const DEFAULT_HASH_LENGTH = 8;
const DEFAULT_ID_MAX_LENGTH = 25;
const DEFAULT_TEXT_PREFIX = '@innertext';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Directive({
  selector: '[mcsId]',
  host: {
    '[attr.id]': 'generatedId'
  }
})

export class IdDirective implements AfterViewInit, OnChanges {

  @Input('mcsId')
  public customId: string;
  public generatedId: string;

  private _hashInstance = new Hashids('', DEFAULT_HASH_LENGTH);

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
   * Returns the host text content with converted to dash
   */
  public get hostTextContent(): string {
    let textContent = (this._elementRef.nativeElement.textContent || '').trim();
    let convertedString = convertSpacesToDash(textContent);
    return convertedString.substring(0,
      Math.min(convertedString.length, DEFAULT_ID_MAX_LENGTH)
    );
  }

  /**
   * Generates the id based on the host text content with hashing id key for uniqueness
   */
  private _generateIdByTextContent(): string {
    let uniqueEncodedId = this._hashInstance.encode(nextUniqueId++);
    return `${uniqueEncodedId}[${DEFAULT_TEXT_PREFIX}=${this.hostTextContent}]`;
  }

  /**
   * Generates the id based on the custom input with hashing id key for uniqueness
   */
  private _generateIdByCustomInput(): string {
    let uniqueEncodedId = this._hashInstance.encode(nextUniqueId++);
    return `${uniqueEncodedId}[${DEFAULT_TEXT_PREFIX}=${this.customId}]`;
  }

  /**
   * Sets the default settings based on criteria
   */
  private _generateUniqueId(): void {
    this.generatedId = isNullOrEmpty(this.customId) ?
      this._generateIdByTextContent() :
      this._generateIdByCustomInput();
    this._changeDetectorRef.markForCheck();
  }
}
