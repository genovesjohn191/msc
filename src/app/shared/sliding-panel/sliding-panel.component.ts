import {
  Component,
  Input,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  ElementRef,
  Renderer2
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
  animateFactory,
  isNullOrEmpty
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
    trigger('slideInPanel', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1 })),
      transition('void => *', group([
        query('@slideRight', animateChild()),
        animate('150ms cubic-bezier(0.25, 0.8, 0.25, 1)'),
      ])),
      transition('* => void', group([
        query('@slideRight', animateChild()),
        animate('250ms 100ms linear', style({ opacity: 0 }))
      ])),
    ])
  ],
  host: {
    'class': 'sliding-panel-wrapper',
    '[attr.id]': 'id',
    '[tabindex]': 'tabindex'
  }
})

export class SlidingPanelComponent {
  @Input()
  public id: string = `mcs-sliding-panel-${nextUniqueId++}`;

  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value); }
  private _tabindex: number = 0;

  @Input()
  public set placement(value: McsPlacementType) {
    if (this._placement !== value) {
      this._placement = value;
      this._setPlacement();
    }
  }
  private _placement: McsPlacementType;

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

  public constructor(
    private _changeDetectorRef: ChangeDetectorRef,
    private _elementRef: ElementRef,
    private _renderer: Renderer2
  ) { }

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

  /**
   * Sets the placement
   */
  private _setPlacement(): void {
    // TODO: Include the left placement for the mobile navigation and add additional color
    // so that we could only use 1 component for both
    if (isNullOrEmpty(this.placement)) { return; }
    this._renderer.addClass(this._elementRef.nativeElement, `sliding-panel-${this._placement}`);
    this._changeDetectorRef.markForCheck();
  }
}
