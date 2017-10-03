import {
  async,
  TestBed,
  ComponentFixture,
  fakeAsync,
  tick
} from '@angular/core/testing';
import {
  Component,
  ViewChild
} from '@angular/core';
import {
  Subscription,
  Observable,
  Subject
} from 'rxjs/Rx';
import { LoaderDirective } from './loader.directive';
import { LoaderModule } from './loader.module';

@Component({
  selector: 'mcs-test-loader',
  template: ``
})
export class TestLoaderComponent {
  @ViewChild(LoaderDirective)
  public loader: LoaderDirective;

  public subscription: Subscription;
  public search: Subject<any> = new Subject<any>();
  public startSubscription() {
    this.subscription = Observable.concat(this.search)
      .distinctUntilChanged()
      .subscribe((response) => {
        return response;
      });
  }

  public endSubscription() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

describe('LoaderDirective', () => {

  /** Stub Services/Components */
  let component: TestLoaderComponent;
  let fixtureInstance: ComponentFixture<TestLoaderComponent>;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        TestLoaderComponent
      ],
      imports: [
        LoaderModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(TestLoaderComponent, {
      set: {
        template: `
        <div>LoaderDirective Template</div>
        <div [mcsLoader]="subscription"></div>
        `
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      fixtureInstance = TestBed.createComponent(TestLoaderComponent);
      fixtureInstance.detectChanges();

      component = fixtureInstance.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('startSubscription() Event', () => {
    beforeEach(async(() => {
      component.startSubscription();
    }));

    it(`should set the subscription`, () => {
      expect(component.subscription).toBeDefined();
    });

    it(`should set the component reference`, () => {
      expect(component.loader.componentRef).not.toBe(null);
    });
  });

  describe('endSubscription() Event', () => {
    beforeEach(async(() => {
      component.endSubscription();
    }));

    it(`should set unsubscribe to the subscription`, fakeAsync(() => {
      tick(300);
      expect(component.subscription).toBeUndefined();
    }));

    it(`should set to undefined the component reference`, fakeAsync(() => {
      tick(300);
      expect(component.loader.componentRef).toBeUndefined();
    }));
  });
});
