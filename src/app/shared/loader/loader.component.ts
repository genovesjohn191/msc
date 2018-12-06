import {
  Component,
  Input,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ElementRef,
} from '@angular/core';
import {
  CoreDefinition,
  McsUniqueId
} from '@app/core';
import { McsSizeType } from '@app/utilities';

// Unique Id that generates during runtime
type LoaderType = 'spinner' | 'ellipsis';

@Component({
  selector: 'mcs-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[id]': 'id',
    'class': 'loader-wrapper'
  }
})

export class LoaderComponent {
  @Input()
  public id: string = McsUniqueId.NewId('loader');

  @Input()
  public size: McsSizeType = 'medium';

  @Input()
  public type: LoaderType = 'ellipsis';

  constructor(
    private _elementRef: ElementRef,
  ) { }

  /**
   * Returns the loader icon key based on the type provided
   */
  public get loaderIconKey(): string {
    return this.type === 'ellipsis' ?
      CoreDefinition.ASSETS_GIF_LOADER_ELLIPSIS :
      CoreDefinition.ASSETS_GIF_LOADER_SPINNER;
  }

  /**
   * Returns the host element
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }
}
