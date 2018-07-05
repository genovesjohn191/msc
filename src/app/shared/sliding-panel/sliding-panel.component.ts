import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation
} from '@angular/core';
import {
  state,
  group,
  animateChild,
  query,
  style,
  transition,
  trigger,
  animate
} from '@angular/animations';
import { McsPlacementType } from '../../core';
import {
  coerceNumber,
  animateFactory
} from '../../utilities';

// Unique Id that generates during runtime
let nextUniqueId = 0;

@Component({
  selector: 'mcs-sliding-panel',
  templateUrl: './sliding-panel.component.html',
  styleUrls: ['./sliding-panel.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.slideRight,
    animateFactory.slideLeft,
    trigger('slideInPanel', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', group([
        query('@slideRight', animateChild(), { optional: true }),
        query('@slideLeft', animateChild(), { optional: true }),
        animate('150ms cubic-bezier(0.25, 0.8, 0.25, 1)'),
      ])),
      transition('* => void', group([
        query('@slideRight', animateChild(), { optional: true }),
        query('@slideLeft', animateChild(), { optional: true }),
        animate('250ms 100ms linear', style({ opacity: 0 }))
      ])),
    ])
  ],
  host: {
    '[class]': 'hostClass',
    '[attr.id]': 'id',
    '[tabindex]': 'tabindex'
  }
})

export class SlidingPanelComponent {
  public get hostClass(): string {
    return `sliding-panel-wrapper
     sliding-panel-${this.placement}
     sliding-panel-offset-${this.offsetFrom}`;
  }

  @Input()
  public id: string = `mcs-sliding-panel-${nextUniqueId++}`;

  @Input()
  public placement: McsPlacementType = 'left';

  @Input()
  public offsetFrom: 'header' | 'content' = 'content';

  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value); }
  private _tabindex: number = 0;

  /**
   * Returns true when panel is currently opened, otherwise false
   */
  private _panelOpen: boolean;
  public get panelOpen(): boolean { return this._panelOpen; }
  public set panelOpen(value: boolean) {
    if (value !== this._panelOpen) {
      this._panelOpen = value;
      this._changeDetectorRef.markForCheck();
    }
  }

  public constructor(private _changeDetectorRef: ChangeDetectorRef) { }

  /**
   * Opens the panel
   */
  public open(): void {
    this.panelOpen = true;
  }

  /**
   * Closes the panel
   */
  public close(): void {
    this.panelOpen = false;
  }

  /**
   * Toggles the current panel based on status
   */
  public toggle(): void {
    this._panelOpen ? this.close() : this.open();
  }
}
