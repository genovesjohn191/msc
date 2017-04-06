import {
  Component,
  OnInit,
  AfterViewInit,
  Input,
  Renderer,
  ElementRef,
  ViewChild
} from '@angular/core';

/** Providers */
import { AssetsProvider } from '../../core/providers/assets.provider';

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
    private _assetsProvider: AssetsProvider,
    private _renderer: Renderer
  ) {}

  public ngOnInit() {
    if (this.icon) {
      this.iconClass = this._assetsProvider.getIcon(this.icon);
    }
  }

  public ngAfterViewInit() {
    if (this.lightboxId) {
      this._renderer.setElementAttribute(this._mcsLightbox.nativeElement, 'id', this.lightboxId);
    }
  }
}
