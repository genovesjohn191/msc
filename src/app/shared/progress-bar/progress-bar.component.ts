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
  McsSizeType
} from '@app/utilities';

type ProgressMode = 'determinate' | 'indeterminate';

@Component({
  selector: 'mcs-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ProgressBarComponent),
      multi: true
    }
  ],
  host: {
    '[class]': 'hostClasses',
    'role': 'progressbar',
    'aria-valuemin': '0',
    'aria-valuemax': '100',
    '[attr.mode]': 'mode'
  }
})

export class ProgressBarComponent implements AfterViewInit, OnDestroy, ControlValueAccessor {
  @Input()
  public size: McsSizeType = 'medium';

  @Input()
  public mode: ProgressMode = 'determinate';

  @Input()
  public hideBackground: boolean = false;

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
  private _progressBarContainer: ElementRef;
  private _destroySubject = new Subject<void>();

  /**
   * Returns all the classes of the element with space separated
   */
  public get hostClasses(): string {
    return `progress-bar-wrapper`
      + ` progress-bar-${this.size}`
      + ` progress-bar-${this.mode}`;
  }

  public constructor(
    private _ngZone: NgZone,
    private _changeDetectorRef: ChangeDetectorRef
  ) {
    this.maxValue = 0;
    this._value = 0;
  }

  public ngAfterViewInit(): void {
    Promise.resolve().then(() => {
      this._subscribeToAnimationEndOfProgressBar();
    });
  }

  public ngOnDestroy(): void {
    unsubscribeSafely(this._destroySubject);
  }

  /**
   * Returns true when the mode is indeterminate
   */
  public get isTextHidden(): boolean {
    return this.mode === 'indeterminate' ||
      this.size === 'small' ||
      this.size === 'xsmall';
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
    this._changeDetectorRef.markForCheck();
  }

  /**
   * Returns the value in range representation
   */
  public getValueInRange(): number {
    // Minimum value should be equal to 0 aways
    return Math.max(Math.min(this.value, this.maxValue), 0);
  }

  /**
   * Returns the percentage of the progress
   */
  public getPercentage(): number {
    let percentNumber = 100 * this.getValueInRange() / this.maxValue;
    return isNaN(percentNumber) ? 0 : percentNumber;
  }

  /**
   * Returns the string percentage
   */
  public getStringPercentage(): string {
    let percentage = this.getPercentage();
    return percentage.toFixed().toString() + '%';
  }

  /**
   * Returns the progress in scale
   */
  public getProgressScale() {
    let scale = this.getPercentage() / 100;
    return { transform: `scaleX(${scale})` };
  }

  /**
   * Subscribes to animation end of progressbar outside the angular zone
   */
  private _subscribeToAnimationEndOfProgressBar(): void {
    this._ngZone.runOutsideAngular(() => {
      fromEvent<TransitionEvent>(this._progressBarContainer.nativeElement, 'transitionend').pipe(
        takeUntil(this._destroySubject),
        filter((_event: TransitionEvent) => {
          return _event.target === this._progressBarContainer.nativeElement;
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
