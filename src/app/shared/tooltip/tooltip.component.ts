import {
  Component,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef
} from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import {
  Observable,
  Subject
} from 'rxjs/Rx';
import { animateFactory } from '../../utilities';

/** Tooltips declaration type */
export type TooltipPosition = 'left' | 'right' | 'top' | 'bottom';
export type TooltipColor = 'light' | 'dark';

@Component({
  selector: 'mcs-tooltip',
  templateUrl: './tooltip.component.html',
  styleUrls: ['./tooltip.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.scaleIn
  ],
  host: {
    'class': 'tooltip-wrapper',
    '[style.zoom]': 'visibility === "visible" ? 1 : null',
    '(body:click)': 'this.hide()'
  }
})

export class TooltipComponent {

  @ViewChild('tooltipPanel')
  public tooltipPanel: ElementRef;

  public message: string;
  public transformOrigin: string = 'bottom';
  public hideTimeoutId: any;

  /**
   * Returns true when the contextual help is displayed
   */
  private _visible: boolean;
  public get visible(): boolean { return this._visible; }
  public set visible(value: boolean) {
    if (value !== this._visible) {
      this._visible = value;
      this.markForCheck();
    }
  }

  // Stream that emits when tooltip is hidden
  private _onHide: Subject<any>;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.message = '';
    this._onHide = new Subject();
  }

  /**
   * Show the tooltip
   */
  public show(position: TooltipPosition = 'bottom'): void {
    // Cancel the delayed hide if it is scheduled
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
    }

    // Display the tooltip
    this._setTransformOrigin(position);
    this.visible = true;
  }

  /**
   * Hide the tooltip
   */
  public hide(delay: number): void {
    this.hideTimeoutId = setTimeout(() => {
      this.visible = false;
    }, delay);
  }

  /**
   * After hidden observable that emits when tooltip state is changed
   */
  public afterHidden(): Observable<void> {
    return this._onHide.asObservable();
  }

  /**
   * Change visibily of the animation
   * @param e Animation event instance
   */
  public afterVisibilityAnimation(e: AnimationEvent): void {
    let hideElement = e.toState === 'void' && this.visible === false;
    if (hideElement) {
      this._onHide.next();
    }
  }

  /**
   * Sets the tooltip transform origin according to the tooltip position
   * @param value Value of the position of the tooltip to determine the tranform-style
   */
  public _setTransformOrigin(value: TooltipPosition) {
    switch (value) {
      case 'left': this.transformOrigin = 'right'; break;
      case 'right': this.transformOrigin = 'left'; break;
      case 'top': this.transformOrigin = 'bottom'; break;
      case 'bottom':
      default:
        this.transformOrigin = 'top';
        break;
    }
  }

  /**
   * Reflect the changes in the view
   */
  public markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }
}
