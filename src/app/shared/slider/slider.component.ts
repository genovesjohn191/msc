import {
  Component,
  Input,
  Output,
  ViewChild,
  EventEmitter,
  ElementRef,
  forwardRef,
  ChangeDetectorRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  Key,
  McsPoint
} from '../../core';
import {
  isNullOrEmpty,
  coerceNumber,
  coerceBoolean,
  registerEvent,
  unregisterEvent
} from '../../utilities';

/** The slider orientation type */
type sliderOrientation = 'horizontal' | 'vertical';

/** The thumb gap size for a disabled slider. */
const DISABLED_THUMB_GAP = 7;

/** The thumb gap size for a non-active slider at its minimum value. */
const MIN_VALUE_NONACTIVE_THUMB_GAP = 7;

/** The thumb gap size for an active slider at its minimum value. */
const MIN_VALUE_ACTIVE_THUMB_GAP = 10;

@Component({
  selector: 'mcs-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderComponent),
      multi: true
    }
  ],
  host: {
    'class': 'slider-wrapper',
    'role': 'slider',
    '(focus)': 'onFocus()',
    '(blur)': 'onBlur()',
    '(click)': 'onClick($event)',
    '(keydown)': 'onKeydown($event)',
    '(keyup)': 'onKeyup()',
    '(mouseenter)': 'onMouseenter()',
    '(mousedown)': 'onSlideStart($event)',
    '(touchstart)': 'onSlideStart($event)',
    '[attr.tabindex]': 'tabindex',
    '[attr.aria-disabled]': 'disabled',
    '[attr.aria-valuemax]': 'max',
    '[attr.aria-valuemin]': 'min',
    '[attr.aria-valuenow]': 'value',
    '[attr.aria-orientation]': 'orientation',
    '[class.slider-disabled]': 'disabled',
    '[class.slider-has-ticks]': 'showTicks',
    '[class.slider-horizontal]': 'orientation === "horizontal"',
    '[class.slider-vertical]': 'orientation === "vertical"',
    '[class.slider-has-focused]': 'hasFocused',
    '[class.slider-sliding]': 'isSliding',
    '[class.slider-min-value]': 'isMinValue',
    '[class.slider-thumb-label-showing]': 'showLabel'
  }
})

export class SliderComponent {
  /**
   * Event emitted when the slider value has changed.
   */
  @Output()
  public change = new EventEmitter<any>();

  /**
   * Event emitted when the slider thumb moves.
   */
  @Output()
  public input = new EventEmitter<any>();

  /**
   * Label text that shows in the thumb label if provided else it is based on the value
   */
  @Input()
  public labelText: string;

  /**
   * Disabled the slider
   */
  @Input()
  public get disabled(): boolean { return this._disabled; }
  public set disabled(value: boolean) { this._disabled = coerceBoolean(value); }
  private _disabled: boolean = false;

  /**
   * Tab index
   */
  @Input()
  public get tabindex(): number { return this._tabindex; }
  public set tabindex(value: number) { this._tabindex = coerceNumber(value, this._tabindex); }
  private _tabindex: number = 0;

  /**
   * Show the ticks of the slider
   */
  @Input()
  public get showTicks(): boolean { return this._showTicks; }
  public set showTicks(value: boolean) { this._showTicks = coerceBoolean(value); }
  private _showTicks: boolean = false;

  /**
   * The maximum value that the slider can have.
   */
  @Input()
  public get max() { return this._max; }
  public set max(value: number) {
    this._max = coerceNumber(value, this._max);
    this._percent = this._calculatePercentage(this._value);
    this._changeDetectorRef.markForCheck();
  }
  private _max: number = 100;

  /**
   * The minimum value that the slider can have.
   */
  @Input()
  public get min() { return this._min; }
  public set min(value: number) {
    this._min = coerceNumber(value, this._min);
    if (isNullOrEmpty(this._value)) {
      this.value = this._min;
    }
    this._percent = this._calculatePercentage(this._value);
    this._changeDetectorRef.markForCheck();
  }
  private _min: number = 0;

  /**
   * The values at which the thumb will snap.
   */
  @Input()
  public get step() { return this._step; }
  public set step(value: number) {
    this._step = coerceNumber(value, this._min);
    // Check if the step is a whole number, otherwise it will be rounded off.
    if (value && this._step % 1 !== 0) {
      this._roundLabelTo = this._step.toString().split('.').pop()!.length;
    }
    this._changeDetectorRef.markForCheck();
  }
  private _step: number = 1;

  /**
   * Orientation of the slider if it is horizontal or vertical
   */
  @Input()
  public get orientation(): sliderOrientation { return this._orientation; }
  public set orientation(value: sliderOrientation) { this._orientation = value; }
  private _orientation: sliderOrientation = 'horizontal';

  /**
   * Determine whether the slider displays the thumb label (balloon)
   */
  @Input()
  get showLabel(): boolean { return this._showLabel; }
  set showLabel(value) { this._showLabel = coerceBoolean(value); }
  private _showLabel: boolean = false;

  /**
   * Model Value of the slider (Two way binding)
   */
  @Input()
  public get value() {
    if (isNullOrEmpty(this._value)) {
      this.value = this._min;
    }
    return this._value;
  }
  public set value(value: number | null) {
    if (value !== this._value) {
      this._value = coerceNumber(value, this._value || 0);
      this._onChanged(this._value);
      this._percent = this._calculatePercentage(this._value);
      this._changeDetectorRef.markForCheck();
    }
  }
  private _value: number | null = null;

  /**
   * Reference to the inner slider wrapper element.
   */
  @ViewChild('sliderWrapper')
  private _sliderWrapper: ElementRef;

  /**
   * The percentage of the slider that coincides with the value.
   */
  public get percent(): number {
    return this._calculateSnapValue(this._percent);
  }
  private _percent: number = 0;

  /**
   * Returns true when the mouse is dragging, otherwise false
   */
  public get isSliding(): boolean {
    return this._isSliding;
  }
  private _isSliding: boolean = false;

  /** Other member variables */
  private _tickIntervalPercent: number = 0;
  private _sliderDimensions: ClientRect | null = null;
  private _roundLabelTo: number;
  private _valueOnSlideStart: number | null;
  private _isActive: boolean = false;
  private _hasFocused: boolean = false;

  /**
   * Event handler references
   */
  private _onSlideHandler = this.onSlide.bind(this);
  private _onSlideEndHandler = this.onSlideEnd.bind(this);

  /**
   * The value to be used for display purposes.
   */
  public get displayValue(): string | number {
    // Displays the label text from the implementation class
    if (!isNullOrEmpty(this.labelText)) { return this.labelText; }

    // Displayes the rounded value of the slider
    if (this._roundLabelTo && this.value && this.value % 1 !== 0) {
      return this.value.toFixed(this._roundLabelTo);
    }
    return this.value || 0;
  }

  /**
   * Whether the slider is at its minimum value.
   */
  public get isMinValue(): boolean {
    return this.percent === 0;
  }

  /**
   * The amount of space to leave between the slider thumb and the track fill & track background
   * elements.
   */
  public get thumbGap() {
    if (this.disabled) { return DISABLED_THUMB_GAP; }
    // Add a gap for the thumb when the value is @ minimum and label thumb is not display
    if (this.isMinValue && !this.showLabel) {
      return this._isActive ? MIN_VALUE_ACTIVE_THUMB_GAP : MIN_VALUE_NONACTIVE_THUMB_GAP;
    }
    return 0;
  }

  /**
   * CSS styles for the track background element.
   */
  public get trackBackgroundStyles(): { [key: string]: string } {
    let axis = this.orientation === 'vertical' ? 'Y' : 'X';
    return {
      'transform': `translate${axis}(${this.thumbGap}px) scale${axis}(${1 - this.percent})`
    };
  }

  /**
   * CSS styles for the track fill element.
   */
  public get trackFillStyles(): { [key: string]: string } {
    let axis = this.orientation === 'vertical' ? 'Y' : 'X';
    return {
      'transform': `translate${axis}(-${this.thumbGap}px) scale${axis}(${this.percent})`
    };
  }

  /**
   * CSS styles for the ticks container element.
   */
  public get ticksContainerStyles(): { [key: string]: string } {
    let axis = this.orientation === 'vertical' ? 'Y' : 'X';
    let offset = this._tickIntervalPercent / 2 * 100;
    return {
      'transform': `translate${axis}(-${offset}%)`
    };
  }

  /**
   * CSS styles for the ticks element.
   */
  public get ticksStyles(): { [key: string]: string } {
    let tickSize = this._tickIntervalPercent * 100;
    let backgroundSize = this.orientation === 'vertical' ? `2px ${tickSize}%` : `${tickSize}% 2px`;
    let axis = this.orientation === 'vertical' ? 'Y' : 'X';
    let styles: { [key: string]: string } = {
      'backgroundSize': backgroundSize,
      'transform': `translateZ(0) translate${axis}(${tickSize / 2}%)`
    };

    if (this.isMinValue && this.thumbGap) {
      let side = this.orientation === 'vertical' ? 'Top' : 'Left';
      styles[`padding${side}`] = `${this.thumbGap}px`;
    }

    return styles;
  }

  /**
   * CSS styles for the thumb container element.
   */
  public get thumbContainerStyles(): { [key: string]: string } {
    let axis = this.orientation === 'vertical' ? 'Y' : 'X';
    let offset = (1 - this.percent) * 100;
    return {
      'transform': `translate${axis}(-${offset}%)`
    };
  }

  /**
   * Returns true when the slider has focus, otherwise returns false
   */
  public get hasFocused(): boolean {
    return this._hasFocused;
  }

  /**
   * Returns the Host Element of the component
   */
  public get hostElement(): HTMLElement {
    return this._elementRef.nativeElement;
  }

  public constructor(
    private _elementRef: ElementRef,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  /**
   * Event that emits when mouse is entered
   */
  public onMouseenter(): void {
    if (this.disabled) { return; }

    // We save the dimensions of the slider here so we can use them to update the spacing of the
    // ticks and determine where on the slider click and slide events happen.
    this._sliderDimensions = this._getSliderDimensions();
    this._updateTickIntervalPercent();
  }

  /**
   * Event that emits when mouse is click
   * @param event Corresponding event response
   */
  public onClick(event: MouseEvent | TouchEvent) {
    if (this.disabled) { return; }

    let oldValue = this.value;
    this._isSliding = false;
    this._focusHostElement();

    let position = this._getMouseEventCoordinates(event);
    this._updateValueFromPosition(position);

    // Emit a change and input event if the value changed.
    if (oldValue !== this.value) {
      this._emitInputEvent();
      this._emitChangeEvent();
    }
  }

  /**
   * Event that emits when the slide started
   * @param event Corresponding event response
   */
  public onSlideStart(event: MouseEvent | TouchEvent | null) {
    if (this.disabled || this._isSliding) { return; }

    // Register sliding events
    this._registerMouseEvents();

    this._focusHostElement();
    this._valueOnSlideStart = this.value;
    if (event) {
      let position = this._getMouseEventCoordinates(event);
      this._updateValueFromPosition(position);
      event.preventDefault();
    }
  }

  /**
   * Event that emits while the mouse is dragging
   * @param event Corresponding event response
   */
  public onSlide(event: MouseEvent | TouchEvent) {
    if (this.disabled) { return; }

    // The slide start event sometimes fails to fire on iOS, so if we're not already in the sliding
    // state, call the slide start handler manually.
    if (!this._isSliding) {
      this._isSliding = true;
      this.onSlideStart(null);
    }

    // Prevent the slide from selecting anything else.
    event.preventDefault();
    let oldValue = this.value;
    let position = this._getMouseEventCoordinates(event);
    this._updateValueFromPosition(position);

    // Native range elements always emit `input` events when the value changed while sliding.
    if (oldValue !== this.value) {
      this._emitInputEvent();
    }
  }

  /**
   * Event that emits when the sliding is finished
   */
  public onSlideEnd() {
    this._isSliding = false;

    // Unregister sliding events
    this._unregisterMouseEvents();

    if (this._valueOnSlideStart !== this.value) {
      this._emitChangeEvent();
    }
    this._valueOnSlideStart = null;
  }

  /**
   * Event that emits when key is pressed
   * @param event Keyboard event
   */
  public onKeydown(event: KeyboardEvent) {
    if (this.disabled) { return; }

    // Check key code and increment/decrement the slider value
    let oldValue = this.value;
    switch (event.keyCode) {
      case Key.PageUp:
        this._increment(10);
        break;
      case Key.PageDown:
        this._increment(-10);
        break;
      case Key.End:
        this.value = this.max;
        break;
      case Key.Home:
        this.value = this.min;
        break;
      case Key.DownArrow:
      case Key.LeftArrow:
        this._increment(-1);
        break;
      case Key.RightArrow:
      case Key.UpArrow:
        this._increment(1);
        break;
      default:
        // Do nothing
        return;
    }

    // Notify output parameters
    if (oldValue !== this.value) {
      this._emitInputEvent();
      this._emitChangeEvent();
    }
    this._isSliding = true;
    event.preventDefault();
  }

  /**
   * Event that emits when key is up
   */
  public onKeyup() {
    this._isSliding = false;
  }

  /**
   * Event that emits when slider element has focus
   */
  public onFocus() {
    this._hasFocused = true;
    this._sliderDimensions = this._getSliderDimensions();
    this._updateTickIntervalPercent();
  }

  /**
   * Event that emits when slider element remove focus
   */
  public onBlur() {
    this._hasFocused = false;
    this._onTouched();
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

  // View <-> Model callback methods
  private _onChanged: (value: any) => void = () => { /** dummy */ };
  private _onTouched = () => { /** dummy */ };

  /**
   * Calculates the percentage of the slider that a value is.
   */
  private _calculatePercentage(value: number | null) {
    return ((value || 0) - this.min) / (this.max - this.min);
  }

  /**
   * Calculates the value a percentage of the slider corresponds to.
   */
  private _calculateTrackValue(percentage: number) {
    return this.min + percentage * (this.max - this.min);
  }

  /**
   * Returns a number between the minimum and maximum value.
   *
   * `@Note:` This will return if the supplied value is not greater
   * than the maximum value inputted, otherwise the max is returned
   * @param value Value to get from the calculated value
   * @param min Minimum value to be returned when the value is less than the minimum
   * @param max Maximum value to be returned when the value is greater than the maximum
   */
  private _calculateSnapValue(value: number, min = 0, max = 1) {
    return Math.max(min, Math.min(value, max));
  }

  /**
   * Get the bounding client rect of the slider track element.
   * The track is used rather than the native element to ignore the extra space that the thumb can
   * take up.
   */
  private _getSliderDimensions() {
    return this._sliderWrapper ? this._sliderWrapper.nativeElement.getBoundingClientRect() : null;
  }

  /**
   * Focuses the native element.
   * Currently only used to allow a blur event to fire but will be used with keyboard input later.
   */
  private _focusHostElement() {
    this._elementRef.nativeElement.focus();
  }

  /**
   * Emits a change event if the current value is different from the last emitted value.
   */
  private _emitChangeEvent() {
    this.change.emit(this.value);
  }

  /**
   * Emits an input event when the current value is different from the last emitted value.
   */
  private _emitInputEvent() {
    this.input.emit(this.value);
  }

  /**
   * Increments the slider by the given number of steps (negative number decrements).
   * @param numSteps Number of steps to consider
   */
  private _increment(numSteps: number) {
    this.value = this._calculateSnapValue(
      (this.value || 0) + this.step * numSteps, this.min, this.max
    );
  }

  /**
   * Calculate the new value from the new physical location. The value will always be snapped.
   */
  private _updateValueFromPosition(pos: McsPoint) {
    if (isNullOrEmpty(this._sliderDimensions)) { return; }

    // Set the size and offset position of the slider
    let offset = this.orientation === 'vertical' ?
      this._sliderDimensions.top : this._sliderDimensions.left;
    let size = this.orientation === 'vertical' ?
      this._sliderDimensions.height : this._sliderDimensions.width;
    let posComponent = this.orientation === 'vertical' ? pos.y : pos.x;

    // Calculate the track percentage and track exact value based on the mouse point
    let trackPercent = this._calculateSnapValue((posComponent - offset) / size);
    let trackValue = this._calculateTrackValue(trackPercent);

    // Find the closest step by finding the closest whole number divisible by the
    // step relative to the min.
    let closestValue = Math.round((trackValue - this.min) / this.step) * this.step + this.min;
    if (trackValue >= this.max) {
      closestValue = this.max;
    }
    this.value = this._calculateSnapValue(closestValue, this.min, this.max);
  }

  /**
   * Updates the amount of space between ticks as a percentage of the width of the slider.
   */
  private _updateTickIntervalPercent() {
    if (!this.showTicks || !this._sliderDimensions) { return; }
    this._tickIntervalPercent = this.step / (this.max - this.min);
  }

  /**
   * Returns the associated coordinate of the mouse event
   * @param event Triggered event
   */
  private _getMouseEventCoordinates(event: MouseEvent | TouchEvent): McsPoint {
    let position = new McsPoint();
    // Set position based on event triggered
    position.x = !!(event instanceof MouseEvent) ?
      event.clientX : event.changedTouches[0].clientX;
    position.y = !!(event instanceof MouseEvent) ?
      event.clientY : event.changedTouches[0].clientY;

    // Return the coordinates of the mouse
    return position;
  }

  /**
   * Register the associated mouse events for the slider
   */
  private _registerMouseEvents(): void {
    registerEvent(document, 'mousemove', this._onSlideHandler);
    registerEvent(document, 'touchmove', this._onSlideHandler);
    registerEvent(document, 'mouseup', this._onSlideEndHandler);
    registerEvent(document, 'touchend', this._onSlideEndHandler);
  }

  /**
   * UnRegister the associated mouse events for the slider
   */
  private _unregisterMouseEvents(): void {
    unregisterEvent(document, 'mousemove', this._onSlideHandler);
    unregisterEvent(document, 'touchmove', this._onSlideHandler);
    unregisterEvent(document, 'mouseup', this._onSlideEndHandler);
    unregisterEvent(document, 'touchend', this._onSlideEndHandler);
  }
}
