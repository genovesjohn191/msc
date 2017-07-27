import {
  Component,
  OnChanges,
  AfterViewInit,
  Input,
  Output,
  Renderer2,
  ElementRef,
  ViewChild,
  forwardRef,
  HostListener
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

/** Interface */
import { Loading } from '../loading.interface';

/** Core */
import {
  McsAssetsProvider,
  McsList,
  McsListItem,
  CoreDefinition
} from '../../core';

@Component({
  selector: 'mcs-dropdown',
  templateUrl: './dropdown.component.html',
  styles: [require('./dropdown.component.scss')],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DropdownComponent),
      multi: true
    }
  ]
})

export class DropdownComponent implements OnChanges, AfterViewInit, ControlValueAccessor {
  public iconClass: string;
  public isOpen: boolean;
  public selectedItem: McsListItem;

  @Input()
  public dropdownData: McsList;

  @Input()
  public name: string;

  @Input()
  public placeholder: string;

  @Input()
  public width: string;

  @ViewChild('mcsDropdown')
  public mcsDropdown: ElementRef;

  @ViewChild('mcsDropdownGroupName')
  public mcsDropdownGroupName: ElementRef;

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

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _renderer: Renderer2,
    private _elementRef: ElementRef,
  ) {
    this.dropdownData = new McsList();
    this.isOpen = false;
    this.selectedItem = new McsListItem(undefined, undefined);
  }

  // TODO: For testing in actual mobile devices
  @HostListener('document:touchstart', ['$event.target'])
  @HostListener('document:click', ['$event.target'])
  public onClickOutside(target): void {
    if (!this._elementRef.nativeElement.contains(target)) {
      this.isOpen = false;
    }
  }

  public ngOnChanges() {
    this.iconClass = 'caret-down';
    this.getSelectedItem(this.option);
  }

  public ngAfterViewInit() {
    if (this.width) {
      this._renderer.setStyle(this.mcsDropdown.nativeElement,
        'max-width', this.width);
    }
  }

  public toggleDropdown(event) {
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
}
