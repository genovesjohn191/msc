import {
  async,
  TestBed,
  getTestBed,
  ComponentFixture,
  fakeAsync,
  tick,
  discardPeriodicTasks
} from '@angular/core/testing';
import {
  Component,
  ViewChild
} from '@angular/core';
import { McsAuthenticationIdentity } from '@app/core';
import {
  McsIdentity,
  McsKeyValuePair
} from '@app/models';
import { CoreTestingModule } from '@app/core/testing';
import { IsExperimentalDirective } from './is-experimental.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(IsExperimentalDirective, { static: false })
  public isExperimental: IsExperimentalDirective;
}

describe('IsExperimentalDirective', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixtureInstance: ComponentFixture<TestComponent>;
  let mcsAuthenticationIdentity: McsAuthenticationIdentity;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        IsExperimentalDirective
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div *isExperimental="true">Hello World</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();
      component = fixtureInstance.componentInstance;
      mcsAuthenticationIdentity = getTestBed().get(McsAuthenticationIdentity);
    });
  }));

  describe('ngOnChanges()', () => {
    it(`should render the element when set to true and feature is enabled`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      let feature = new McsKeyValuePair();
      feature.key = 'enableExperimentalFeatures';
      feature.value = true;
      userIdentity.features = [feature];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.isExperimental.viewContainer, 'createEmbeddedView');
      component.isExperimental.isExperimental = true;
      component.isExperimental.ngOnChanges();
      tick();
      expect(component.isExperimental.viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should not render the element when set to false and feature is enabled`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      let feature = new McsKeyValuePair();
      feature.key = 'enableExperimentalFeatures';
      feature.value = true;
      userIdentity.features = [feature];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.isExperimental.viewContainer, 'clear');
      component.isExperimental.isExperimental = false;
      component.isExperimental.ngOnChanges();
      tick();
      expect(component.isExperimental.viewContainer.clear).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should not render the element when set to true and feature is disabled`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      let feature = new McsKeyValuePair();
      feature.key = 'enableExperimentalFeatures';
      feature.value = false;
      userIdentity.features = [feature];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.isExperimental.viewContainer, 'clear');
      component.isExperimental.isExperimental = true;
      component.isExperimental.ngOnChanges();
      tick();
      expect(component.isExperimental.viewContainer.clear).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should render the element when set to false and feature is disabled`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      let feature = new McsKeyValuePair();
      feature.key = 'enableExperimentalFeatures';
      feature.value = false;
      userIdentity.features = [feature];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.isExperimental.viewContainer, 'createEmbeddedView');
      component.isExperimental.isExperimental = false;
      component.isExperimental.ngOnChanges();
      tick();
      expect(component.isExperimental.viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));
  });
});
