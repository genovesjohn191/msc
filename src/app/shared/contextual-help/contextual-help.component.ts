import {
  Component,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { AnimationEvent } from '@angular/animations';
import {
  Observable,
  Subject
} from 'rxjs';
import { animateFactory } from '../../utilities';

@Component({
  selector: 'mcs-contextual-help',
  templateUrl: './contextual-help.component.html',
  styleUrls: ['./contextual-help.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.scaleIn
  ],
  host: {
    'class': 'contextual-help-wrapper',
    '[style.zoom]': 'visibility === "visible" ? 1 : null'
  }
})

export class ContextualHelpComponent {
  public message: string;
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
    this.visible = false;
    this._onHide = new Subject();
  }

  /**
   * Show the contextual help
   */
  public show(): void {
    // Cancel the delayed hide if it is scheduled
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
    }

    // Display the contextual help
    this.visible = true;
  }

  /**
   * Hide the contextual help
   */
  public hide(delay: number): void {
    this.hideTimeoutId = setTimeout(() => {
      this.visible = false;
    }, delay);
  }

  /**
   * After hidden observable that emits when contextual help state is changed
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
   * Reflect the changes in the view
   */
  public markForCheck(): void {
    this._changeDetectorRef.markForCheck();
  }
}
