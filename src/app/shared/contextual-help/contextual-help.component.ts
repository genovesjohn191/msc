import {
  Component,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy,
  ViewChild,
  ElementRef
} from '@angular/core';
import {
  animate,
  AnimationEvent,
  state,
  style,
  transition,
  trigger
} from '@angular/animations';
import {
  Observable,
  Subject
} from 'rxjs/Rx';

export type ContextualVisibility = 'initial' | 'visible' | 'hidden';

@Component({
  selector: 'mcs-contextual-help',
  templateUrl: './contextual-help.component.html',
  styleUrls: ['./contextual-help.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('state', [
      state('void', style({ transform: 'scale(0)' })),
      state('initial', style({ transform: 'scale(0)' })),
      state('visible', style({ transform: 'scale(1)' })),
      state('hidden', style({ transform: 'scale(0)' })),
      transition('* => visible', animate('150ms cubic-bezier(0.0, 0.0, 0.2, 1)')),
      transition('* => hidden', animate('150ms cubic-bezier(0.4, 0.0, 1, 1)')),
    ])
  ],
  host: {
    'class': 'contextual-help-wrapper',
    '[style.zoom]': 'visibility === "visible" ? 1 : null'
  }
})

export class ContextualHelpComponent {

  @ViewChild('contextualPanel')
  public contextualPanel: ElementRef;

  public message: string;
  public visibility: ContextualVisibility;
  public transformOrigin: string = 'bottom';
  public hideTimeoutId: any;

  // Stream that emits when tooltip is hidden
  private _onHide: Subject<any>;

  constructor(private _changeDetectorRef: ChangeDetectorRef) {
    this.message = '';
    this.visibility = 'initial';
    this._onHide = new Subject();
  }

  /**
   * Show the tooltip
   */
  public show(): void {
    // Cancel the delayed hide if it is scheduled
    if (this.hideTimeoutId) {
      clearTimeout(this.hideTimeoutId);
    }

    // Display the tooltip
    this._setTransformOrigin();
    this.visibility = 'visible';
    this.markForCheck();
  }

  /**
   * Hide the tooltip
   */
  public hide(delay: number): void {
    this.hideTimeoutId = setTimeout(() => {
      this.visibility = 'hidden';
      this.markForCheck();
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
    if (e.toState === 'hidden' && !(this.visibility === 'visible')) {
      this._onHide.next();
    }
  }

  /**
   * Sets the tooltip transform origin according to the tooltip position
   * @param value Value of the position of the tooltip to determine the tranform-style
   */
  public _setTransformOrigin(value = 'right') {
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
