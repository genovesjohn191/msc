import {
  Component,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  Input,
  ContentChild
} from '@angular/core';
import {
  coerceBoolean,
  isNullOrEmpty
} from '@app/utilities';
import { PresentationPanelHeaderDirective } from './header/presentation-panel-header.directive';

@Component({
  selector: 'mcs-presentation-panel',
  templateUrl: './presentation-panel.component.html',
  styleUrls: ['./presentation-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    'class': 'presentation-panel-wrapper',
    '[class.presentation-card]': 'embossed'
  }
})

export class PresentationPanelComponent {

  @Input()
  public get embossed(): boolean { return this._embossed; }
  public set embossed(value: boolean) {
    this._embossed = coerceBoolean(value);
  }
  private _embossed: boolean;

  @ContentChild(PresentationPanelHeaderDirective, { static: false })
  private _presentationPanelHeader: PresentationPanelHeaderDirective;

  /**
   * Returns true when the presentation panel has header
   */
  public get hasHeader(): boolean {
    return !isNullOrEmpty(this._presentationPanelHeader);
  }
}
