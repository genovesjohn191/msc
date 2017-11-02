import {
  async,
  TestBed,
  ComponentFixture
} from '@angular/core/testing';
import { ElementRef } from '@angular/core';
import { ContextualHelpComponent } from './contextual-help.component';
import { ContextualHelpDirective } from './contextual-help.directive';

describe('ContextualHelpComponent', () => {

  /** Stub Services/Components */
  let component: ContextualHelpComponent;
  let fixtureInstance: ComponentFixture<ContextualHelpComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        ContextualHelpComponent
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(ContextualHelpComponent, {
      set: {
        template: `
          <section class="contextual-help-container">
            <div *ngFor="let context of contextualInformations">
              <span #textElement [ngStyle]="getTextStyle(textElement, context)">
                {{ context.getContextualHelp() }}
              </span>
            </div>
          </section>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(ContextualHelpComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('getTextStyle()', () => {
    let createdElement: HTMLElement;

    beforeEach(async(() => {
      createdElement = document.createElement('div');
      let contextualHelpDirective = new ContextualHelpDirective(
        new ElementRef(createdElement), undefined);
      component.contextualInformations.push(contextualHelpDirective);
      fixtureInstance.detectChanges();
    }));

    // TODO: Refactor the unit of contextual help component
  });
});
