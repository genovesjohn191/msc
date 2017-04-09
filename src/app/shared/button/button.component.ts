import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  Renderer,
  ElementRef,
  ViewChild
} from '@angular/core';

/** Interface */
import { Loading } from '../loading.interface';

/** Providers */
import { AssetsProvider } from '../../core';

@Component({
  selector: 'mcs-button',
  templateUrl: './button.component.html',
  styles: [require('./button.component.scss')]
})

export class ButtonComponent implements OnInit, AfterViewInit, Loading {
  public iconLeftClass: string;
  public iconRightClass: string;
  public loaderKey: string;
  public loaderImage: string;
  public isLoading: boolean;

  @Input()
  public type: string;

  @Input()
  public iconLeft: string;

  @Input()
  public iconRight: string;

  @Input()
  public size: string;

  @Input()
  public width: number;

  @Input()
  public lightboxId: string;

  @Input()
  public lightboxDismiss: string;

  @Input()
  public disabled: boolean;

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('mcsButton')
  public mcsButton: ElementRef;

  public constructor(
    private _assetsProvider: AssetsProvider,
    private _renderer: Renderer
  ) {
    this.loaderKey = 'loader';
    this.isLoading = false;
  }

  public ngOnInit() {
    this.loaderImage = this._assetsProvider.getImagePath(this.loaderKey);

    if (this.iconLeft) {
      this.iconLeftClass = this._assetsProvider.getIcon(this.iconLeft);
    }

    if (this.iconRight) {
      this.iconRightClass = this._assetsProvider.getIcon(this.iconRight);
    }
  }

  public ngAfterViewInit() {
    if (this.type) {
      this._renderer.setElementClass(this.mcsButton.nativeElement, this.type, true);
    }

    if (this.iconLeftClass || this.iconRightClass) {
      this._renderer.setElementClass(this.mcsButton.nativeElement, 'has-icon', true);
    }

    if (this.size) {
      this._renderer.setElementClass(this.mcsButton.nativeElement, this.size, true);
    }

    if (this.width) {
      this._renderer.setElementStyle(this.mcsButton.nativeElement, 'max-width', this.width + 'px');
      this._renderer.setElementClass(this.mcsButton.nativeElement, 'w-100', true);
    }

    if (this.lightboxId) {
      this._renderer.setElementAttribute(this.mcsButton.nativeElement, 'data-toggle', 'modal');
      this._renderer.setElementAttribute(
        this.mcsButton.nativeElement, 'data-target', '#' + this.lightboxId);
    }

    if (this.lightboxDismiss === 'true') {
      this._renderer.setElementAttribute(this.mcsButton.nativeElement, 'data-dismiss', 'modal');
    }

    if (this.disabled) {
      this._renderer.setElementProperty(this.mcsButton.nativeElement, 'disabled', this.disabled);
    }
  }

  public emitEvent($event) {
    this.onClick.emit($event);
  }

  public showLoader(): void {
    this.isLoading = true;
    this._renderer.setElementClass(this.mcsButton.nativeElement, 'hidden-xl-down', true);
  }

  public hideLoader(): void {
    this.isLoading = false;
    this._renderer.setElementClass(this.mcsButton.nativeElement, 'hidden-xl-down', false);
  }
}
