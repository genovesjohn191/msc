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

/** Providers */
import { AssetsProvider } from '../../core/providers/assets.provider';

@Component({
  selector: 'mcs-button',
  templateUrl: './button.component.html',
  styles: [require('./button.component.scss')]
})

export class ButtonComponent implements OnInit, AfterViewInit {
  public iconLeftClass: string;
  public iconRightClass: string;

  @Input()
  public iconLeft: string;

  @Input()
  public iconRight: string;

  @Input()
  public size: string;

  @Input()
  public width: number;

  @Output()
  public onClick: EventEmitter<any> = new EventEmitter();

  @ViewChild('mcsButton')
  private _mcsbutton: ElementRef;

  public constructor(
    private _assetsProvider: AssetsProvider,
    private _renderer: Renderer
  ) {}

  public ngOnInit() {
    if (this.iconLeft) {
      this.iconLeftClass = this._assetsProvider.getIcon(this.iconLeft);
    }

    if (this.iconRight) {
      this.iconRightClass = this._assetsProvider.getIcon(this.iconRight);
    }
  }

  public ngAfterViewInit() {
    if (this.iconLeft || this.iconRight) {
      this._renderer.setElementClass(this._mcsbutton.nativeElement, 'has-icon', true);
    }

    if (this.size) {
      this._renderer.setElementClass(this._mcsbutton.nativeElement, this.size, true);
    }

    if (this.width) {
      this._renderer.setElementStyle(this._mcsbutton.nativeElement, 'width', this.width + 'px');
    }
  }

  public emitEvent($event) {
    this.onClick.emit($event);
  }
}
