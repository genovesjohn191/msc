import {
  NgForm,
  FormGroupDirective,
  FormControl
} from '@angular/forms';
import {
  Subject
} from 'rxjs/Rx';
import { NgControl } from '@angular/forms';
import {
  isNullOrEmpty,
  ErrorStateMatcher,
  defaultErrorStateMatcher
} from '../../utilities';

/** An interface which allows a control to work inside of a `MdFormField`. */
export abstract class McsFormFieldControlBase<T> {
  /**
   * Stream that emits whenever the state of the control changes such that the parent `MdFormField`
   * needs to run change detection.
   */
  public stateChanges: Subject<void> = new Subject<void>();

  /** Gets the NgControl for this control. */
  public ngControl: NgControl | null;

  /** Whether the control is focused. */
  public focused: boolean;

  /** Whether the control is in an error state. */
  public errorState: boolean;

  /** The value of the control. */
  public abstract value: T;

  /** The element ID for this control. */
  public abstract id: string;

  /** The element Placeholder for this control */
  public abstract placeholder: string;

  /** Error state matcher to be used in checking error forms */
  public abstract errorStateMatcher: ErrorStateMatcher;

  /** Whether the control is required. */
  public abstract required: boolean;

  /** Whether the control is disabled. */
  public abstract disabled: boolean;

  constructor(
    protected elementForm: HTMLElement,
    protected parentForm: NgForm | FormGroupDirective
  ) {
    // Add the default state matcher for controls otherwise set the custom matcher
    this.errorStateMatcher = this.errorStateMatcher || defaultErrorStateMatcher;
  }

  /**
   * Determine whether the control is empty
   */
  public abstract isEmpty(): boolean;

  /**
   * Focuses the associated control.
   *
   * `@Note:` You can overriede this method if you have other implementation
   */
  public focus(): void {
    if (isNullOrEmpty(this.elementForm)) { return; }
    this.elementForm.focus();
  }

  /**
   * Update the error state of the control based on inputted value
   *
   * `@Note:` You can overriede this method if you have other implementation
   */
  public updateErrorState(): void {
    let oldState = this.errorState;
    let ngControl = this.ngControl;
    let parent = this.parentForm;
    let newState = ngControl && this.errorStateMatcher(ngControl.control as FormControl, parent);

    if (newState !== oldState) {
      this.errorState = newState;
      this.stateChanges.next();
    }
  }
}