import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  Renderer,
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
import { AssetsProvider } from '../../core/providers/assets.provider';

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
    private _assetsProvider: AssetsProvider,
    private _renderer: Renderer
  ) {}

  public ngOnInit() {
    if (this.icon) {
      this.iconClass = this.getIconClass(this.icon);
    }
  }

  public ngAfterViewInit() {
    if (this.width) {
      this._renderer.setElementStyle(this.mcsTextbox.nativeElement,
        'max-width', this.width + 'px');
      this._renderer.setElementClass(this.mcsTextbox.nativeElement, 'w-100', true);
    }
  }

  public onFocus(event): void {
    this._renderer.setElementClass(this.mcsTextbox.nativeElement, 'active', true);
  }

  public onFocusOut(event): void {
    this._renderer.setElementClass(this.mcsTextbox.nativeElement, 'active', false);
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
    this.iconClass = this.getIconClass('text-spinner');
  }

  public hideLoader(): void {
    this.iconClass = this.getIconClass(this.icon);
  }

  public getIconClass(iconKey: string): string {
    return this._assetsProvider.getIcon(iconKey);
  }

}
