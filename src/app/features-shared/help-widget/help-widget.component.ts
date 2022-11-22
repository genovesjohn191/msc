import {
  animate,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  ViewEncapsulation
} from '@angular/core';
import {
  CoreRoutes,
  McsUniqueId
} from '@app/core';
import { RouteKey } from '@app/models';
import {
  animateFactory,
  isNullOrEmpty,
  CommonDefinition
} from '@app/utilities';
import { ANIMATION_TIMING } from '@app/utilities/functions/animations/expansion';

@Component({
  selector: 'mcs-help-widget',
  templateUrl: './help-widget.component.html',
  styleUrls: ['./help-widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('expansionVerticalPosition', [
      state('collapsed', style({ width: '0px', height: '0px', visibility: 'hidden', overflow: 'hidden' })),
      state('expanded', style({ width: '*', height: '*', visibility: 'visible', overflow: 'hidden' })),
      transition('collapsed <=> expanded', animate(ANIMATION_TIMING))
    ]),
    animateFactory.rotate180
  ],
  host: {
    'class': 'help-widget-wrapper',
    '[attr.id]': 'id',
    '[attr.hidden-small]': 'true',
    '[class.hide-element]': 'hidden'
  }
})

export class HelpWidgetComponent {
  public hidden: boolean = false;
  public collapse: boolean = true;

  @Input()
  public id: string = McsUniqueId.NewId('help-widget');

  @Input()
  public serviceId: string;

  constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Returns the help icon key
   */
  public get helpIconKey(): string {
    return CommonDefinition.ASSETS_SVG_HELP;
  }

  /**
   * Returns the raise ticket link
   */
  public get raiseTicketLink(): string {
    return isNullOrEmpty(this.serviceId) ?
      CoreRoutes.getNavigationPath(RouteKey.TicketCreate) :
      `${CoreRoutes.getNavigationPath(RouteKey.TicketCreate)}?serviceId=${this.serviceId}`;
  }

  /**
   * Event that emits when icon is clicked
   */
  public toggleWidget(): void {
    this.collapse = !this.collapse;
    this._changeDetectorRef.markForCheck();
  }
}
