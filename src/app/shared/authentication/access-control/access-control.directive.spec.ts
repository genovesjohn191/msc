import {
  async,
  TestBed,
  getTestBed,
  ComponentFixture,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {
  Component,
  ViewChild
} from '@angular/core';
import {
  CoreDefinition,
  McsApiIdentity,
  McsAuthenticationIdentity,
  McsKeyValuePair
} from '../../../core';
import { CoreTestingModule } from '../../../core/testing';
import { AppState } from '../../../app.service';
import { AccessControlDirective } from './access-control.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(AccessControlDirective)
  public accessControl: AccessControlDirective;
}

describe('AccessControlDirective', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixtureInstance: ComponentFixture<TestComponent>;
  let appState: AppState;
  let mcsAuthenticationIdentity: McsAuthenticationIdentity;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        AccessControlDirective
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div *mcsAccessControl="['VmAccess']">Hello World</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();
      appState = getTestBed().get(AppState);
      component = fixtureInstance.componentInstance;
      mcsAuthenticationIdentity = getTestBed().get(McsAuthenticationIdentity);
    });
  }));

  describe('ngOnChanges()', () => {
    it(`should render the element when permission required is present`, fakeAsync(() => {
      let userIdentity = new McsApiIdentity();
      userIdentity.permissions = ['VmAccess', 'VmEdit'];
      userIdentity.features = [];
      appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, userIdentity);
      mcsAuthenticationIdentity.applyIdentity();

      spyOn(component.accessControl.viewContainer, 'createEmbeddedView');
      component.accessControl.requiredPermission = ['VmEdit'];
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
    }));

    it(`should render the element when feature required is enabled`, fakeAsync(() => {
      let userIdentity = new McsApiIdentity();
      userIdentity.permissions = ['VmAccess'];
      let feature = new McsKeyValuePair();
      feature.key = 'createServer';
      feature.value = true;
      userIdentity.features = [feature];
      appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, userIdentity);
      mcsAuthenticationIdentity.applyIdentity();

      spyOn(component.accessControl.viewContainer, 'createEmbeddedView');
      component.accessControl.requiredPermission = [];
      component.accessControl.feature = 'createServer';
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
    }));

    it(`should not render the element if permission is missing`, fakeAsync(() => {
      let userIdentity = new McsApiIdentity();
      userIdentity.permissions = ['VmAccess'];
      userIdentity.features = [];
      appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, userIdentity);
      mcsAuthenticationIdentity.applyIdentity();

      spyOn(component.accessControl.viewContainer, 'clear');
      component.accessControl.requiredPermission = ['VmEdit'];
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.clear).toHaveBeenCalledTimes(1);
    }));

    it(`should not render the element if feature is disabled`, fakeAsync(() => {
      let userIdentity = new McsApiIdentity();
      userIdentity.permissions = ['VmAccess'];
      userIdentity.features = [];
      appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, userIdentity);
      mcsAuthenticationIdentity.applyIdentity();

      spyOn(component.accessControl.viewContainer, 'clear');
      component.accessControl.requiredPermission = [];
      component.accessControl.feature = 'createServer';
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.clear).toHaveBeenCalledTimes(1);
    }));
  });
});
