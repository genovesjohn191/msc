import {
  Component,
  ElementRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  Input
} from '@angular/core';
import { animateFactory } from '@app/utilities';

@Component({
  selector: 'mcs-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeOut
  ],
  host: {
    'class': 'loading-wrapper'
  }
})

export class LoadingComponent {
  @Input()
  public loadingText: string;

  public constructor(private _elementRef: ElementRef) { }

  /**
   * Returns the host element of the loading component
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }
}
