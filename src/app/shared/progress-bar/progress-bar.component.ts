import {
  Component,
  forwardRef,
  Input,
  ViewEncapsulation,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  EventEmitter,
  Output,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  NgZone
} from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR
} from '@angular/forms';
import { AnimationEvent } from '@angular/animations';
import {
  Subject,
  fromEvent
} from 'rxjs';
import {
  takeUntil,
  filter
} from 'rxjs/operators';
import {
  coerceNumber,
  unsubscribeSafely,
  animateFactory
} from '@app/utilities';
import { McsComponentHandlerService } from '@app/core';

@Component({
  selector: 'mcs-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    animateFactory.fadeInOut
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProgressBarComponent),
      multi: true
    }
  ],
  host: {
    'class': 'progress-bar-wrapper',
    '[@fadeInOut]': 'animationState',
    '(@fadeInOut.done)': 'onAnimationDone($event)'
  }
})

export class ProgressBarComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  public animationState: string;

  @Output()
  public completed = new EventEmitter<ProgressBarComponent>();

  @Input()
  public get maxValue(): number { return this._maxValue; }
  public set maxValue(value: number) { this._maxValue = coerceNumber(value); }
  private _maxValue: number;

  /**
   * Model Value of the Progressbar (Two way binding)
   */
  @Input()
  public get value() { return this._value; }
  public set value(value: any) {
    if (value !== this._value) {
      this._value = value;
      this._onChanged(value);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _value: any;

  @ViewChild('progressBarContainer')
  private progressBarContainer: ElementRef;
  private _destroySubject = new Subject<void>();

  public constructor(
    private _ngZone: NgZone,
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef,
    private _componentHandler: McsComponentHandlerService
  ) {
    this.maxValue = 0;
    this._value = 0;
  }

  public ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this.animationState = 'in';
      this._subscribeToAnimationEndOfProgressBar();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Write value implementation of ControlValueAccessor
   * @param value Model binding value
   */
  public writeValue(value: any) {
    this.value = value;
  }

  /**
   * On Change Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnChange(fn: any) {
    this._onChanged = fn;
  }

  /**
   * On Touched Event implementation of ControlValueAccessor
   * @param fn Function Invoker
   */
  public registerOnTouched(fn: any) {
    this._onTouched = fn;
  }

  /**
   * Event that emits when focus is removed
   */
  public onBlur(): void {
    this._onTouched();
  }

  /**
   * Event that emits when the progress bar transition has been ended
   */
  public onProgressbarTransitionEnd(): void {
    if (this.value < this.maxValue) { return; }
    this.completed.next(this);
    this.animationState = 'void';
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Event that emits when the animation of the main component has been ended
   */
  public onAnimationDone(event: AnimationEvent): void {
    if (event.toState !== 'void') { return; }
    this._componentHandler.deleteComponent(this._elementRef);
  }

  /**
   * Returns the value in range representation
   */
  public getValueInRange(): number {
    // Minimum value should be equal to 0 aways
    return Math.max(Math.min(this.value, this.maxValue), 0);
  }

  /**
   * Returns the percentage into string representation
   */
  public getPercentage(): string {
    // Return the percentage of the current value based on the maximum value inputted
    let percentNumber = 100 * this.getValueInRange() / this.maxValue;
    percentNumber = isNaN(percentNumber) ? 0 : percentNumber;
    return percentNumber.toFixed().toString() + '%';
  }

  /**
   * Subscribes to animation end of progressbar outside the angular zone
   */
  private _subscribeToAnimationEndOfProgressBar(): void {
    this._ngZone.runOutsideAngular(() => {
      fromEvent<TransitionEvent>(this.progressBarContainer.nativeElement, 'transitionend').pipe(
        takeUntil(this._destroySubject),
        filter((_event: TransitionEvent) => {
          return _event.target === this.progressBarContainer.nativeElement;
        })
      ).subscribe(() => {
        this._ngZone.run(() => this.onProgressbarTransitionEnd());
      });
    });
  }

  // View <-> Model callback methods
  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };
}
