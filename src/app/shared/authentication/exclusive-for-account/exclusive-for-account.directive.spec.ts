import {
  async,
  TestBed,
  getTestBed,
  ComponentFixture
} from '@angular/core/testing';
import {
  Component,
  ViewChild
} from '@angular/core';
import {
  CoreDefinition,
  McsCookieService
} from '../../../core';
import { ExclusiveForAccountDirective } from './exclusive-for-account.directive';
import { CoreTestingModule } from '../../../core/testing';

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
        <div id="mcsAccount" *mcsExclusiveForAccount="'default'">Hello World</div>
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
      and active account type are the same`, () => {
        component.exclusiveForAccount.mcsExclusiveForAccount = 'default';
        cookieService.removeItem(CoreDefinition.COOKIE_ACTIVE_ACCOUNT);

        fixtureInstance.changeDetectorRef.markForCheck();
        let element = document.getElementById('mcsAccount');
        expect(element).not.toBe(null);
      });
  });
});
