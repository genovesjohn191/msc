import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { CoreTestingModule } from '@app/core/testing';

import { ProgressBarComponent } from './progress-bar.component';
import { ProgressBarModule } from './progress-bar.module';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(ProgressBarComponent, { static: false })
  public progressbarComponent: ProgressBarComponent;

  public progressValue: number = 10;
  public progressMax: number = 100;
}

describe('ProgressBarComponent', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent
      ],
      imports: [
        FormsModule,
        ProgressBarModule,
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <mcs-progress-bar
          [(ngModel)]="progressValue"
          [maxValue]="progressMax"></mcs-progress-bar>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixture = TestBed.createComponent(TestComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it(`should create the mcs-progress-bar element`, () => {
      let element = document.querySelector('mcs-progress-bar');
      expect(element).not.toBe(null);
    });
  });

  describe('modelValue()', () => {
    it(`should set the current value of progress bar to 10`, () => {
      expect(component.progressbarComponent.value).toBe(component.progressValue);
    });

    it(`should set the maximum value of progress bar to 100`, () => {
      expect(component.progressbarComponent.maxValue).toBe(component.progressMax);
    });
  });

  describe('modelUpdate()', () => {
    it(`should upate the currently value of progressbar to 50%`, () => {
      component.progressValue = 50;
      component.progressbarComponent.writeValue(component.progressValue);
      fixture.detectChanges();
      expect(component.progressbarComponent.value).toBe(component.progressValue);
    });
  });
});
