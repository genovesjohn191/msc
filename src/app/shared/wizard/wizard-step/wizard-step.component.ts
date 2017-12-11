import {
  Component,
  Input,
  Output,
  EventEmitter,
  ViewChild,
  ContentChild,
  TemplateRef,
  ViewEncapsulation,
  ChangeDetectionStrategy
} from '@angular/core';
import { WizardActionPlacementDirective } from './wizard-action-placement.directive';
import { coerceBoolean } from '../../../utilities';

// Unique Id that generates during runtime
let nextUniqueId = 0;

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

export class WizardStepComponent {
  @Input()
  public id: any = `mcs-wizard-step-item-${nextUniqueId++}`;

  @Input()
  public stepTitle: string;

  @Input()
  public customClass: string;

  @Output()
  public onNext: EventEmitter<any>;

  @ViewChild(TemplateRef)
  public templateRef: TemplateRef<any>;

  @ContentChild(WizardActionPlacementDirective)
  public actionPlacement: WizardActionPlacementDirective;

  public enabled: boolean;
  public isActive: boolean;
  public completed: boolean;

  @Input()
  public get hidden(): boolean { return this._hidden; }
  public set hidden(value: boolean) { this._hidden = coerceBoolean(value); }
  private _hidden: boolean;

  @Input()
  public get showNext(): boolean { return this._showNext; }
  public set showNext(value: boolean) { this._showNext = coerceBoolean(value); }
  private _showNext: boolean;

  @Input()
  public get showPrevious(): boolean { return this._showPrevious; }
  public set showPrevious(value: boolean) { this._showPrevious = coerceBoolean(value); }
  private _showPrevious: boolean;

  public constructor() {
    this.stepTitle = '';
    this.hidden = false;
    this.showNext = true;
    this.showPrevious = true;
    this.isActive = false;
    this.enabled = false;
    this.completed = false;
    this.onNext = new EventEmitter();
  }
}
