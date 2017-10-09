import {
  Component,
  forwardRef,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  OnChanges,
  Renderer2
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import {
  McsListItem,
  CoreDefinition,
  Key
} from '../../core';

@Component({
  selector: 'mcs-radio-button-group',
  templateUrl: './radio-button-group.component.html',
  styleUrls: ['./radio-button-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RadioButtonGroupComponent),
      multi: true
    }
  ]
})

export class RadioButtonGroupComponent implements OnChanges, ControlValueAccessor {
  @Input()
  public items: McsListItem[];

  @Input()
  public orientation: 'horizontal' | 'vertical';

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('radioButtonGroupElement')
  public radioButtonGroupElement: ElementRef;

  public itemIndex: number;

  /**
   * On Touched Event Callback
   */
  private _onTouched: () => {};

  /**
   * On Changed Event Callback
   */
  private _onChanged: (_: any) => {};

  /**
   * Active Item (model binding)
   */
  private _activeKeyItem: any;
  public get activeKeyItem(): any {
    return this._activeKeyItem;
  }
  public set activeKeyItem(value: any) {
    if (value !== this._activeKeyItem) {
      this._activeKeyItem = value;
      this._onChanged(value);
    }
  }

  public constructor(private _renderer: Renderer2) {
    this.itemIndex = 0;
    this.items = new Array();
    this.orientation = 'vertical';
  }

  public ngOnChanges() {
    if (this.orientation) {
      this._renderer.addClass(this.radioButtonGroupElement.nativeElement,
        this.orientation);
    }

    // Get item index to get the current selected item in the list
    for (let index = 0; index < this.items.length; ++index) {
      if (this.items[index].key === this.activeKeyItem) {
        this.itemIndex = index;
        break;
      }
    }
  }

  public onClickEvent(event: Event, item: McsListItem) {
    if (item) { this.activeKeyItem = item.key; }
    this.onClick.emit(event);
  }

  public onKeyDown(event: KeyboardEvent) {
    let keyEnum = event.keyCode as Key;

    // Filter arrow keys only
    if (keyEnum !== Key.UpArrow &&
      keyEnum !== Key.DownArrow &&
      keyEnum !== Key.RightArrow &&
      keyEnum !== Key.LeftArrow) {
      return true;
    }
    let itemPosition = this.getItemPosition(keyEnum);

    switch (itemPosition) {
      case 'next':

        if (this.itemIndex === (this.items.length - 1)) {
          // Set to initial item if the index was greater than the length of the items
          this.itemIndex = 0;
        } else {
          this.itemIndex += 1;
        }
        break;

      case 'previous':

        if (this.itemIndex === 0) {
          // Set to last index of the items when item index is less than zero
          this.itemIndex = (this.items.length - 1);
        } else {
          this.itemIndex -= 1;
        }
        break;

      default:
        return true;
    }

    // Get the target item based on the index and assign it
    // to model binding to update the view and model bind
    this.activeKeyItem = this.items[this.itemIndex].key;

    // Return false to all cases of the arrow to remove the scrolling when
    // clicking the arrow keys else true
    return false;
  }

  public getItemPosition(key: Key): 'next' | 'previous' {
    let itemPosition: 'next' | 'previous';

    switch (this.orientation) {
      case 'horizontal':
        itemPosition = (key === Key.UpArrow ||
          key === Key.RightArrow) ?
          itemPosition = 'next' : itemPosition = 'previous';
        break;

      case 'vertical':
      default:
        itemPosition = (key === Key.DownArrow ||
          key === Key.RightArrow) ?
          itemPosition = 'next' : itemPosition = 'previous';
        break;
    }
    return itemPosition;
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    if (value !== this._activeKeyItem) {
      this._activeKeyItem = value;
    }
  }

  /**
   * On Change Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnChange(fn: any) {
    this._onChanged = fn;
  }

  /**
   * On Touched Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  /**
   * Get radio button svg icons key based on the checked flag,
   * if it is checked the obtain svg icon is the checked
   * else it is unchecked
   */
  public getRadioButtonIconKey(item: McsListItem): string {
    return this._activeKeyItem === item.key ?
      CoreDefinition.ASSETS_SVG_RADIO_CHECKED :
      CoreDefinition.ASSETS_SVG_RADIO_UNCHECKED;
  }
}
