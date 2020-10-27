import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewEncapsulation
} from '@angular/core';
import { McsUniqueId } from '@app/core';
import {
  coerceBoolean,
  isNullOrEmpty,
  CommonDefinition,
  KeyboardKey
} from '@app/utilities';

@Component({
  selector: 'mcs-tag',
  templateUrl: './tag.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('state', [
      state('in', style({ transform: 'scale(1)' })),
      state('void', style({ transform: 'scale(0)' })),
      transition('* => in', animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
      transition('* => void', animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
    ])
  ],
  host: {
    'class': 'tag-wrapper',
    'role': 'option',
    'tabindex': '-1',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(keydown)': 'onKeyDown($event)',
    '(click)': 'onClick($event)',
    '[class.tag-wrapper-selected]': 'selected',
    '[@state]': '"in"'
  }
})

export class TagComponent {

  public hasFocus: boolean;

  @Output()
  public selectionChanged = new EventEmitter<TagComponent>();

  @Output()
  public removed = new EventEmitter<TagComponent>();

  @Output()
  public receivedFocus = new EventEmitter<TagComponent>();

  @Input()
  public id: string = McsUniqueId.NewId('tag');

  @Input()
  public get removable(): boolean { return this._removable; }
  public set removable(value: boolean) { this._removable = coerceBoolean(value); }
  private _removable: boolean = true;

  @Input()
  public get selectable(): boolean { return this._selectable; }
  public set selectable(value: boolean) { this._selectable = coerceBoolean(value); }
  private _selectable: boolean = true;

  @Input()
  public get selected(): boolean { return this._selected; }
  public set selected(value: boolean) {
    this._selected = coerceBoolean(value);
    this._changeDetectorRef.markForCheck();
  }
  private _selected: boolean = false;

  @Input()
  public get value(): any {
    return isNullOrEmpty(this._value) ?
      this._elementRef.nativeElement.textContent : this._value;
  }
  public set value(value: any) { this._value = value; }
  private _value: string;

  public get removeIconKey(): string {
    return this.selected ?
      CommonDefinition.ASSETS_SVG_CLOSE_BLACK :
      CommonDefinition.ASSETS_SVG_CLOSE_WHITE;
  }

  constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef
  ) { }

  /**
   * Select the corresponding tag
   */
  public select(): void {
    this.selected = true;
  }

  /**
   * Deselect the tag
   */
  public deselect(): void {
    this.selected = false;
  }

  /**
   * Remove the tag from the list and notify output parameter
   */
  public remove(mouseEvent?: MouseEvent): void {
    if (!isNullOrEmpty(mouseEvent)) {
      mouseEvent.preventDefault();
      mouseEvent.stopPropagation();
    }

    if (!this.removable) { return; }
    this.removed.emit(this);
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Set focus to tag element
   */
  public focus(): void {
    this._elementRef.nativeElement.focus();
  }

  /**
   * Event that emits when the tag received focus
   */
  public onFocus(): void {
    this.hasFocus = true;
    this.receivedFocus.next(this);
  }

  /**
   * Event that emits when the tag removed focus
   */
  public onBlur(): void {
    this.hasFocus = false;
  }

  /**
   * Event that emits when the tag received keyboard input
   */
  public onKeyDown(_event: KeyboardEvent): void {
    switch (_event.keyboardKey()) {
      case KeyboardKey.Delete:
      case KeyboardKey.Backspace:
        this.remove();
        _event.preventDefault();
        break;

      case KeyboardKey.Space:
        // Toggle the selection of the tag
        if (this.selectable) {
          this.selected ? this.deselect() : this.select();
          this._emitSelectionChanged();
        }
        _event.preventDefault();
        break;

      default:
        // Do noting
        break;
    }
  }

  /**
   * Event that emits when the tag received click
   * @param _event Mouse click event
   */
  public onClick(_event: MouseEvent): void {
    _event.preventDefault();
    _event.stopPropagation();
    this.onFocus();
  }

  /**
   * Notify the selection changed when the tag is selected
   */
  private _emitSelectionChanged(): void {
    this.selectionChanged.emit(this);
  }
}
