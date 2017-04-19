import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Output,
  EventEmitter,
  Renderer2,
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
    private _renderer: Renderer2
  ) {}

  public ngOnInit() {
    if (this.iconLeft) {
      this.iconLeftClass = this.getIconClass(this.iconLeft);
    }

    if (this.iconRight) {
      this.iconRightClass = this.getIconClass(this.iconRight);
    }
  }

  public ngAfterViewInit() {
    if (this.type) {
      this._renderer.addClass(this.mcsButton.nativeElement, this.type);
    }

    if (this.iconLeftClass || this.iconRightClass) {
      this._renderer.addClass(this.mcsButton.nativeElement, 'has-icon');
    }

    if (this.size) {
      this._renderer.addClass(this.mcsButton.nativeElement, this.size);
    }

    if (this.width) {
      this._renderer.setStyle(this.mcsButton.nativeElement, 'max-width', this.width + 'px');
      this._renderer.addClass(this.mcsButton.nativeElement, 'w-100');
    }

    if (this.lightboxId) {
      this._renderer.setAttribute(this.mcsButton.nativeElement, 'data-toggle', 'modal');
      this._renderer.setAttribute(
        this.mcsButton.nativeElement, 'data-target', '#' + this.lightboxId);
    }

    if (this.lightboxDismiss === 'true') {
      this._renderer.setAttribute(this.mcsButton.nativeElement, 'data-dismiss', 'modal');
    }

    if (this.disabled) {
      this._renderer.setProperty(this.mcsButton.nativeElement, 'disabled', this.disabled);
    }
  }

  public emitEvent($event) {
    this.onClick.emit($event);
  }

  public showLoader(): void {
    this.iconRightClass = this.getIconClass('spinner');
  }

  public hideLoader(): void {
    this.iconRightClass = this.getIconClass(this.iconRight);
  }

  public getIconClass(iconKey: string): string {
    return this._assetsProvider.getIcon(iconKey);
  }
}
