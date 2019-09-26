import {
  Directive,
  Input,
  Output,
  EventEmitter,
  ElementRef
} from '@angular/core';
import { Subject } from 'rxjs';
import { Key } from '@app/models';
import {
  isNullOrEmpty,
  coerceBoolean
} from '@app/utilities';

@Directive({
  selector: 'input[mcsTagInput]',
  exportAs: 'mcsTagInput',
  host: {
    'class': 'tag-input-wrapper',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(keydown)': 'onKeyDown($event)'
  }
})
export class TagInputDirective {

  public focused: boolean = false;
  public receiveFocus = new Subject<void>();
  public receiveBlur = new Subject<void>();
  public receiveKeydown = new Subject<KeyboardEvent>();

  public inputElement: HTMLInputElement;

  @Output('mcsTagInputOnAdd')
  public get tagInputOnAdd(): EventEmitter<TagInputDirective> { return this._tagInputOnAdd; }
  private _tagInputOnAdd = new EventEmitter<TagInputDirective>();

  @Input('mcsTagInputAddOnBlur')
  public get addOnBlur(): boolean { return this._addOnBlur; }
  public set addOnBlur(value: boolean) { this._addOnBlur = coerceBoolean(value); }
  private _addOnBlur: boolean;

  @Input('mcsTagInputSeparatorKeys')
  public get separatorKeyCodes(): number[] { return this._separatorKeyCodes; }
  public set separatorKeyCodes(value: number[]) { this._separatorKeyCodes = value; }
  private _separatorKeyCodes: number[] = [Key.Enter];

  constructor(private _elementRef: ElementRef) {
    this.inputElement = this._elementRef.nativeElement as HTMLInputElement;
  }

  /**
   * Set focus to input element
   */
  public focus(): void {
    this.inputElement.focus();
  }

  /**
   * Event that emits when the input received focus
   */
  public onFocus(): void {
    this.focused = true;
    this.receiveFocus.next();
  }

  /**
   * Event that emits when the input removed focus
   */
  public onBlur(): void {
    if (this.addOnBlur) { this._emitTagEnd(); }
    this.focused = false;
    this.receiveBlur.next();
  }

  /**
   * Event that emits when the input received keyboard input
   */
  public onKeyDown(_event?: KeyboardEvent): void {
    this._emitTagEnd(_event);
  }

  /**
   * Event that emits when the key codes for the creation of tag is received
   * @param _event Associated keyboard event
   */
  private _emitTagEnd(_event?: KeyboardEvent) {
    if (!this.inputElement.value && !!_event) {
      this.receiveKeydown.next(_event);
    }

    // Add the tag when some of the key codes is received
    let keyCodeReceived = isNullOrEmpty(_event) ||
      this.separatorKeyCodes.indexOf(_event.keyCode) > -1;
    if (keyCodeReceived) {
      this._tagInputOnAdd.emit(this);
      if (!isNullOrEmpty(_event)) {
        _event.preventDefault();
      }
    }
  }
}
