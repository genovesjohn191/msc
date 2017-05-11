import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  Renderer2,
  ElementRef,
  ViewChild,
  forwardRef
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';

/** Interface */
import { Loading } from '../loading.interface';

/** Providers */
import { McsAssetsProvider } from '../../core';

@Component({
  selector: 'mcs-textbox',
  templateUrl: './textbox.component.html',
  styles: [require('./textbox.component.scss')],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TextboxComponent),
      multi: true
    }
  ]
})

export class TextboxComponent implements OnInit, AfterViewInit, ControlValueAccessor, Loading {
  public iconClass: string;

  @Input()
  public icon: string;

  @Input()
  public name: string;

  @Input()
  public placeholder: string;

  @Input()
  public width: number;

  @ViewChild('mcsTextbox')
  public mcsTextbox: ElementRef;

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
  private _text: string;

  public get text(): string {
    return this._text;
  }

  public set text(value: string) {
    if (value !== this._text) {
      this._text = value;
      if (this._onChanged) {
        this._onChanged(value);
      }
    }
  }

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _renderer: Renderer2
  ) {}

  public ngOnInit() {
    if (this.icon) {
      this.iconClass = this.getIconClass(this.icon);
    }
  }

  public ngAfterViewInit() {
    if (this.width) {
      this._renderer.setStyle(this.mcsTextbox.nativeElement,
        'max-width', this.width + 'px');
      this._renderer.addClass(this.mcsTextbox.nativeElement, 'w-100');
    }
  }

  public onFocus(event): void {
    this._renderer.addClass(this.mcsTextbox.nativeElement, 'active');
  }

  public onFocusOut(event): void {
    this._renderer.removeClass(this.mcsTextbox.nativeElement, 'active');
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    this._text = value;
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

  public showLoader(): void {
    this.iconClass = this.getIconClass('spinner');
  }

  public hideLoader(): void {
    this.iconClass = this.getIconClass(this.icon);
  }

  public getIconClass(iconKey: string): string {
    return this._assetsProvider.getIcon(iconKey);
  }

}
