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
import { CoreDefinition } from '../../core';
import { McsCookieService } from '../../core';
import { ExclusiveForAccountDirective } from './exclusive-for-account.directive';
import { CoreTestingModule } from '../../core/testing';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(ExclusiveForAccountDirective)
  public exclusiveForAccount: ExclusiveForAccountDirective;
}

describe('ExclusiveForAccountDirective', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixtureInstance: ComponentFixture<TestComponent>;
  let cookieService: McsCookieService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestComponent,
        ExclusiveForAccountDirective
      ],
      imports: [
        CoreTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestComponent, {
      set: {
        template: `
        <div *mcsExclusiveForAccount="'default'">Hello World</div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestComponent);
      fixtureInstance.detectChanges();
      cookieService = getTestBed().get(McsCookieService);
      component = fixtureInstance.componentInstance;
    });
  }));

  describe('mcsExclusiveForAccount()', () => {
    it(`should render the element if the provided account type
      and active account type are the same`, fakeAsync(() => {
      spyOn(component.exclusiveForAccount.viewContainer, 'clear');
      component.exclusiveForAccount.mcsExclusiveForAccount = 'default';
      cookieService.removeItem(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);
      expect(component.exclusiveForAccount.viewContainer.clear)
        .toHaveBeenCalledTimes(1);
    }));

    it(`should not render the element if the provided account type
      and active account type are different`, fakeAsync(() => {
      spyOn(component.exclusiveForAccount.viewContainer, 'createEmbeddedView');
      component.exclusiveForAccount.mcsExclusiveForAccount = 'default';
      cookieService.setEncryptedItem<string>(
        CoreDefinition.COOKIE_ACTIVE_ACCOUNT,
        '61477cfb66ba4cee8a6a18c17b40e30f');
      expect(component.exclusiveForAccount.viewContainer.createEmbeddedView)
        .toHaveBeenCalledTimes(1);
    }));
  });
});
