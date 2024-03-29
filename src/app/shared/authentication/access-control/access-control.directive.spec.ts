import {
  Component,
  ViewChild
} from '@angular/core';
import {
  discardPeriodicTasks,
  fakeAsync,
  tick,
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { McsAuthenticationIdentity } from '@app/core';
import { CoreTestingModule } from '@app/core/testing';
import {
  McsIdentity,
  McsKeyValuePair
} from '@app/models';

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
  let mcsAuthenticationIdentity: McsAuthenticationIdentity;

  beforeEach(waitForAsync(() => {
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
        <div *mcsAccessControl="['ManagedCloudVmAccess', 'SelfManagedCloudVmAccess', 'DedicatedVmAccess']">Hello World</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();
      component = fixtureInstance.componentInstance;
      mcsAuthenticationIdentity = TestBed.inject(McsAuthenticationIdentity);
    });
  }));

  describe('ngOnChanges()', () => {
    it(`should render the element when any permission required is present`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      userIdentity.permissions = [
        'ManagedCloudVmAccess',
        'SelfManagedCloudVmAccess',
        'DedicatedVmAccess',
        'DedicatedVmEdit',
        'ManagedCloudVmEdit',
        'SelfManagedCloudVmEdit'
      ];
      userIdentity.features = [];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.accessControl.viewContainer, 'createEmbeddedView');
      component.accessControl.permission = ['DedicatedVmEdit', 'ManagedCloudVmEdit', 'SelfManagedCloudVmEdit'];
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should render the element when all permission required is present`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      userIdentity.permissions = [
        'ManagedCloudVmAccess',
        'SelfManagedCloudVmAccess',
        'DedicatedVmAccess',
        'DedicatedVmEdit',
        'ManagedCloudVmEdit',
        'SelfManagedCloudVmEdit'
      ];
      userIdentity.features = [];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.accessControl.viewContainer, 'createEmbeddedView');
      component.accessControl.permission = ['DedicatedVmEdit', 'ManagedCloudVmEdit', 'SelfManagedCloudVmEdit'];
      component.accessControl.requireAllPermissions = true;
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should render the element when any feature required is enabled`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      userIdentity.permissions = ['ManagedCloudVmAccess', 'SelfManagedCloudVmAccess', 'DedicatedVmAccess'];
      let feature = new McsKeyValuePair();
      feature.key = 'enablePublicCloud';
      feature.value = true;
      let feature2 = new McsKeyValuePair();
      feature2.key = 'enableOrdering';
      feature2.value = true;
      userIdentity.features = [feature, feature2];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.accessControl.viewContainer, 'createEmbeddedView');
      component.accessControl.permission = [];
      component.accessControl.feature = 'enablePublicCloud';
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should render the element when all feature required is enabled`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      userIdentity.permissions = ['ManagedCloudVmAccess', 'SelfManagedCloudVmAccess', 'DedicatedVmAccess'];
      let feature = new McsKeyValuePair();
      feature.key = 'enablePublicCloud';
      feature.value = true;
      let feature2 = new McsKeyValuePair();
      feature2.key = 'enableOrdering';
      feature2.value = true;
      userIdentity.features = [feature, feature2];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.accessControl.viewContainer, 'createEmbeddedView');
      component.accessControl.permission = [];
      component.accessControl.feature = ['enablePublicCloud', 'enableOrdering'];
      component.accessControl.requireAllFeatureFlags = true;
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should not render the element if any permission is required and all are missing`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      userIdentity.permissions = ['ManagedCloudVmAccess', 'SelfManagedCloudVmAccess', 'DedicatedVmAccess'];
      userIdentity.features = [];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.accessControl.viewContainer, 'clear');
      component.accessControl.permission = ['DedicatedVmEdit', 'ManagedCloudVmEdit', 'SelfManagedCloudVmEdit'];
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.clear).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should not render the element if all permissions are required and any is missing`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      userIdentity.permissions = ['ManagedCloudVmAccess', 'SelfManagedCloudVmAccess', 'DedicatedVmAccess'];
      userIdentity.features = [];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.accessControl.viewContainer, 'clear');
      component.accessControl.permission = ['DedicatedVmEdit', 'ManagedCloudVmAccess', 'SelfManagedCloudVmAccess'];
      component.accessControl.requireAllPermissions = true;
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.clear).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should not render the element if any feature is required and all is disabled`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      userIdentity.permissions = [];
      let feature = new McsKeyValuePair();
      feature.key = 'enablePublicCloud';
      feature.value = false;
      let feature2 = new McsKeyValuePair();
      feature2.key = 'enableOrdering';
      feature2.value = false;
      userIdentity.features = [feature, feature2];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.accessControl.viewContainer, 'clear');
      component.accessControl.permission = [];
      component.accessControl.feature = ['enablePublicCloud', 'enableOrdering'];
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.clear).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should not render the element if all feature is required and any is disabled`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      userIdentity.permissions = [];
      let feature = new McsKeyValuePair();
      feature.key = 'enablePublicCloud';
      feature.value = true;
      let feature2 = new McsKeyValuePair();
      feature2.key = 'enableOrdering';
      feature2.value = false;
      userIdentity.features = [feature, feature2];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.accessControl.viewContainer, 'clear');
      component.accessControl.permission = [];
      component.accessControl.feature = ['enablePublicCloud', 'enableOrdering'];
      component.accessControl.requireAllFeatureFlags = true;
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.clear).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));

    it(`should not render the element if feature required is missing`, fakeAsync(() => {
      let userIdentity = new McsIdentity();
      userIdentity.permissions = [];
      let feature = new McsKeyValuePair();
      feature.key = 'enablePublicCloud';
      feature.value = true;
      userIdentity.features = [feature];
      mcsAuthenticationIdentity.setActiveUser(userIdentity);

      spyOn(component.accessControl.viewContainer, 'clear');
      component.accessControl.permission = [];
      component.accessControl.feature = ['enableOrdering'];
      component.accessControl.ngOnChanges();
      tick();
      expect(component.accessControl.viewContainer.clear).toHaveBeenCalledTimes(1);
      discardPeriodicTasks();
    }));
  });
});
