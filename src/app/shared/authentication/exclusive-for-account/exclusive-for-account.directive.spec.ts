import {
  Component,
  ViewChild
} from '@angular/core';
import {
  waitForAsync,
  ComponentFixture,
  TestBed
} from '@angular/core/testing';
import { McsCookieService } from '@app/core';
import { CoreTestingModule } from '@app/core/testing';
import { CommonDefinition } from '@app/utilities';

import { ExclusiveForAccountDirective } from './exclusive-for-account.directive';

@Component({
  selector: 'mcs-test',
  template: ``
})
export class TestComponent {
  @ViewChild(ExclusiveForAccountDirective, { static: false })
  public exclusiveForAccount: ExclusiveForAccountDirective;
}

describe('ExclusiveForAccountDirective', () => {

  /** Stub Services/Components */
  let component: TestComponent;
  let fixtureInstance: ComponentFixture<TestComponent>;
  let cookieService: McsCookieService;

  beforeEach(waitForAsync(() => {
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
      cookieService = TestBed.inject(McsCookieService);
      component = fixtureInstance.componentInstance;
    });
  }));

  describe('mcsExclusiveForAccount()', () => {
    it(`should render the element if the provided account type
      and active account type are the same`, () => {
        component.exclusiveForAccount.mcsExclusiveForAccount = 'default';
        cookieService.removeItem(CommonDefinition.COOKIE_ACTIVE_ACCOUNT);

        fixtureInstance.changeDetectorRef.markForCheck();
        let element = document.getElementById('mcsAccount');
        expect(element).not.toBe(null);
      });
  });
});
