import {
  Component,
  Input,
  ViewChild,
  TemplateRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { AbstractControl } from '@angular/forms';
import {
  Subject,
  Observable
} from 'rxjs';
import { filter } from 'rxjs/operators';
import { McsUniqueId } from '@app/core';
import { IWizardStep } from './wizard-step.interface';

@Component({
  selector: 'mcs-wizard-step',
  templateUrl: './wizard-step.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'block',
    '[id]': 'id'
  }
})

export class WizardStepComponent implements IWizardStep {

  @Input()
  public id: any = McsUniqueId.NewId('wizard-step');

  @Input()
  public stepTitle: string;

  @Input()
  public customClass: string;

  /** @deprecated Use the nextWhen instead */
  @Input()
  public stepControl: AbstractControl;

  @ViewChild(TemplateRef)
  public templateRef: TemplateRef<any>;

  public enabled: boolean;
  public completed: boolean;
  public isLastStep: boolean;

  public get isActive(): boolean { return this._isActive; }
  public set isActive(value: boolean) {
    if (this._isActive !== value) {
      this._isActive = value;
      this._activeChange.next(this._isActive);
    }
  }
  private _isActive: boolean;
  private _activeChange = new Subject<boolean>();

  public constructor() {
    this.stepTitle = '';
    this.isActive = false;
    this.enabled = false;
    this.completed = false;
    this.isLastStep = false;
  }

  /**
   * Event that emits when the step has been activated
   */
  public activated(): Observable<boolean> {
    return this._activeChange.asObservable().pipe(
      filter((activeStatus) => activeStatus)
    );
  }
}
