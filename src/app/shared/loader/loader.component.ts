import {
  Component,
  Input,
  Renderer2,
  ElementRef,
  ViewChild,
  AfterViewInit
} from '@angular/core';
import { CoreDefinition } from '../../core';
import { coerceBoolean } from '../../utilities';
import { LoaderService } from './loader.service';

@Component({
  selector: 'mcs-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
})

export class LoaderComponent implements AfterViewInit {

  @Input()
  public get expanded(): boolean { return this._expanded; }
  public set expanded(value: boolean) { this._expanded = coerceBoolean(value); }
  private _expanded: boolean;

  @Input()
  public get size(): string { return this._size; }
  public set size(value: string) { this._size = value; }
  private _size: string;

  @Input()
  public get text(): string { return this._text; }
  public set text(value: string) { this._text = value; }
  private _text: string;

  @Input()
  public get orientation(): string { return this._orientation; }
  public set orientation(value: string) { this._orientation = value; }
  private _orientation: string;

  @ViewChild('wrapper')
  private _wrapperElement: ElementRef;

  public constructor(
    private _loaderService: LoaderService,
    private _renderer: Renderer2
  ) {
  }

  public ngAfterViewInit(): void {
    if (this.expanded) {
      this._renderer.addClass(this._wrapperElement.nativeElement, 'expanded');
    }
    if (this.orientation) {
      this._renderer.addClass(this._wrapperElement.nativeElement,
        `${this.orientation}-orientation`);
    }
  }

  public get spinnerIconKey(): string {
    return CoreDefinition.ASSETS_GIF_SPINNER;
  }

  public get fadeOut() {
    return this._loaderService.fadeOut;
  }
}
