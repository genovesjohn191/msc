import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Renderer2,
  ElementRef,
  ViewChild
} from '@angular/core';

/** Providers */
import { McsAssetsProvider } from '../../core';

@Component({
  selector: 'mcs-lightbox',
  templateUrl: './lightbox.component.html',
  styles: [require('./lightbox.component.scss')]
})

export class LightboxComponent implements OnInit, AfterViewInit {
  public iconClass: string;

  @Input()
  public lightboxId: string;

  @Input()
  public title: string;

  @Input()
  public subtitle: string;

  @Input()
  public icon: string;

  @ViewChild('mcsLightbox')
  private _mcsLightbox: ElementRef;

  public constructor(
    private _assetsProvider: McsAssetsProvider,
    private _renderer: Renderer2
  ) {}

  public ngOnInit() {
    if (this.icon) {
      this.iconClass = this._assetsProvider.getIcon(this.icon);
    }
  }

  public ngAfterViewInit() {
    if (this.lightboxId) {
      this._renderer.setAttribute(this._mcsLightbox.nativeElement, 'id', this.lightboxId);
    }
  }
}
