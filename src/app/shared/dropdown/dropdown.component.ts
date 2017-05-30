import {
  Component,
  OnInit,
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
  McsList
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

export class DropdownComponent implements OnInit, AfterViewInit, ControlValueAccessor {
  public iconClass: string;
  public collapsed: boolean;

  @Input()
  public dropdownData: McsList;

  @Input()
  public name: string;

  @Input()
  public placeholder: string;

  @Input()
  public width: number;

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
   * Model Binding
   */
  private _option: string;

  public get option(): string {
    return this._option;
  }

  public set option(value: string) {
    if (value !== this._option) {
      this._option = value;
      if (this._onChanged) {
        this._onChanged(value);
      }
    }
  }

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _renderer: Renderer2,
    private _elementRef: ElementRef
  ) {
    this.dropdownData = new McsList();
    this.option = '';
    this.collapsed = true;
  }

  @HostListener('document:click', ['$event.target'])
  public onClick(target): void {
    if (this._elementRef.nativeElement.contains(target)) {
      if (this.mcsDropdownGroupName && this.mcsDropdownGroupName.nativeElement === target) {
        this.collapsed = false;
      } else {
        this.collapsed = !this.collapsed;
      }
    } else {
      this.collapsed = true;
    }

    this.iconClass = (this.collapsed) ? 'caret-down' : 'sort';
  }

  public ngOnInit() {
    this.iconClass = 'caret-down';
  }

  public ngAfterViewInit() {
    if (this.width) {
      this._renderer.setStyle(this.mcsDropdown.nativeElement,
        'max-width', this.width + 'px');
    }
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    this._option = value;
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
