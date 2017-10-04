import {
  Component,
  OnChanges,
  AfterViewInit,
  Input,
  Renderer2,
  ElementRef,
  ViewChild,
  forwardRef,
  ChangeDetectorRef,
  ChangeDetectionStrategy
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
/** Core */
import {
  McsList,
  McsListItem,
  CoreDefinition
} from '../../core';

import { registerEvent } from '../../utilities';

const DEFAULT_DROPDOWN_PLACEHOLDER = 'Select Option';

@Component({
  selector: 'mcs-dropdown',
  templateUrl: './dropdown.component.html',
  styles: [require('./dropdown.component.scss')],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})

export class DropdownComponent implements OnChanges, AfterViewInit, ControlValueAccessor {
  public selectedItem: McsListItem;

  @Input()
  public dropdownData: McsList;

  @Input()
  public name: string;

  @Input()
  public placeholder: string;

  @Input()
  public width: string;

  @Input()
  public disabled: boolean;

  @ViewChild('mcsDropdown')
  public mcsDropdown: ElementRef;

  @ViewChild('mcsDropdownGroupName')
  public mcsDropdownGroupName: ElementRef;

  /**
   * Flag to determine weather the dropdown items is open
   */
  private _isOpen: boolean;
  public get isOpen(): boolean {
    return this._isOpen;
  }
  public set isOpen(value: boolean) {
    if (this._isOpen !== value) {
      this._isOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }

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
  private _option: any;
  public get option(): any {
    return this._option;
  }
  public set option(value: any) {
    if (value !== this._option) {
      this._option = value;
      this._onChanged(value);
    }
  }

  public get caretDownIconKey(): string {
    return CoreDefinition.ASSETS_FONT_CARET_DOWN;
  }

  public constructor(
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.dropdownData = new McsList();
    this.isOpen = false;
    this.placeholder = DEFAULT_DROPDOWN_PLACEHOLDER;
    this.disabled = false;
  }

  public ngOnChanges() {
    this.getSelectedItem(this.option);
    this._registerEvents();
  }

  public ngAfterViewInit() {
    if (this.width) {
      this._renderer.setStyle(this.mcsDropdown.nativeElement,
        'max-width', this.width);
    }
  }

  public toggleDropdown(event) {
    if (this.disabled) {
      this.isOpen = false;
      return;
    }

    if (this.mcsDropdownGroupName && this.mcsDropdownGroupName.nativeElement === event.target) {
      this.isOpen = true;
    } else {
      this.isOpen = !this.isOpen;
    }
  }

  public onClickItem(item: McsListItem) {
    if (item) { this.option = item.key; }
    this.selectedItem = item;
  }

  public getSelectedItem(option: string) {
    if (option) {
      let groups = this.dropdownData.getGroupNames();
      for (let groupName of groups) {
        for (let item of this.dropdownData.getGroup(groupName)) {
          if (item.key === this.option) {
            this.selectedItem = item;
            break;
          }
        }
      }
    } else {
      this.selectedItem = new McsListItem('', this.placeholder);
    }
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    if (value !== this._option) {
      this._option = value;
      this.getSelectedItem(this.option);
      this._changeDetectorRef.markForCheck();
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

  public onClickOutside(event: any): void {
    if (!this._elementRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  private _registerEvents(): void {
    // Register for mouse click
    registerEvent(this._renderer, document,
      'click', this.onClickOutside.bind(this));

    // Register touch event for IOS
    registerEvent(this._renderer, document,
      'touchstart', this.onClickOutside.bind(this));
  }
}
