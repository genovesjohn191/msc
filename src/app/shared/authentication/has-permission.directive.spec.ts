import {
  async,
  TestBed,
  getTestBed,
  ComponentFixture,
  fakeAsync
} from '@angular/core/testing';
import {
  Component,
  ViewChild
} from '@angular/core';
import { CoreDefinition } from '../../core/core.definition';
import { McsApiIdentity } from '../../core/models/response/mcs-api-identity';
import { AppState } from '../../app.service';
import { HasPermissionDirective } from './has-permission.directive';
import { CoreTestingModule } from '../../core/testing';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(HasPermissionDirective)
  public hasPermission: HasPermissionDirective;
}

describe('HasPermissionDirective', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixtureInstance: ComponentFixture<TestComponent>;
  let appState: AppState;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        HasPermissionDirective
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div *mcsHasPermission="['VmAccess']">Hello World</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();
      appState = getTestBed().get(AppState);
      component = fixtureInstance.componentInstance;
    });
  }));

  describe('ngOnDestroy()', () => {
    it(`should render the element`, fakeAsync(() => {
      let userIdentity = new McsApiIdentity();
      userIdentity.permissions = ['VmAccess', 'VmEdit'];
      appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, userIdentity);

      spyOn(component.hasPermission.viewContainer, 'createEmbeddedView');
      component.hasPermission.mcsHasPermission = ['VmEdit'];
      expect(component.hasPermission.viewContainer.createEmbeddedView).toHaveBeenCalledTimes(1);
    }));

    it(`should not render the element`, fakeAsync(() => {
      let userIdentity = new McsApiIdentity();
      userIdentity.permissions = ['VmAccess'];
      appState.set(CoreDefinition.APPSTATE_AUTH_IDENTITY, userIdentity);

      spyOn(component.hasPermission.viewContainer, 'clear');
      component.hasPermission.mcsHasPermission = ['VmEdit'];
      expect(component.hasPermission.viewContainer.clear).toHaveBeenCalledTimes(1);
    }));
  });
});
