import {
  Directive,
  ElementRef,
  Input,
  AfterViewInit,
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

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Directive({
  selector: '[mcsId]',
  host: {
    '[attr.id]': 'ctaId'
  }
})

export class IdDirective implements AfterViewInit, OnChanges {

  @Input('mcsId')
  public ctaId: string;

  private _hashInstance = new Hashids('', DEFAULT_HASH_LENGTH);

  constructor(private _elementRef: ElementRef) { }

  public ngAfterViewInit() {
    Promise.resolve().then(() => {
      this._setDefaultSettings();
    });
  }

  public ngOnChanges(changes: SimpleChanges): void {
    let customIdHasChanged = changes['customId'];
    if (isNullOrEmpty(customIdHasChanged)) { return; }
    this.ctaId = this._generateIdByCustomInput();
  }

  /**
   * Returns the host text content with converted to dash
   */
  public get hostTextContent(): string {
    let textContent: string;
    textContent = isNullOrEmpty(this.ctaId) ?
      (this._elementRef.nativeElement.textContent || '').trim() :
      this.ctaId;
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
    return `${uniqueEncodedId}[@innertext=${this.hostTextContent}]`;
  }

  /**
   * Generates the id based on the custom input with hashing id key for uniqueness
   */
  private _generateIdByCustomInput(): string {
    let uniqueEncodedId = this._hashInstance.encode(nextUniqueId++);
    return `${uniqueEncodedId}[@innertext=${this.ctaId}]`;
  }

  /**
   * Sets the default settings based on criteria
   */
  private _setDefaultSettings(): void {
    this.ctaId = isNullOrEmpty(this.ctaId) ?
      this._generateIdByTextContent() :
      this._generateIdByCustomInput();
  }
}
