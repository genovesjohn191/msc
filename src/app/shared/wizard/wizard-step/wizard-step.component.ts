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
  public hidden: boolean;

  @Input()
  public showNext: boolean;

  @Input()
  public showPrevious: boolean;

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
