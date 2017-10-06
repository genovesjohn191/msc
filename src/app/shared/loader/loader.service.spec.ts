import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import {
  Subscription,
  Subject
} from 'rxjs/Rx';
import { LoaderService } from './loader.service';

describe('LoaderDirective', () => {

  /** Stub Services/Components */
  let loaderService: LoaderService;

  beforeEach(async(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      providers: [LoaderService]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      loaderService = getTestBed().get(LoaderService);
    });
  }));

  /** Test Implementation */
  describe('setSubscribers() | isActive() only 1 subscription', () => {
    let subscription: Subscription;
    let subject = new Subject<any>();

    beforeEach(async(() => {
      subscription = subject.subscribe((something) => {
        return something;
      });
      loaderService.setSubscribers(subscription);
    }));

    it(`should set the active flag to true`, () => {
      expect(loaderService.isActive()).toBeTruthy();
    });

    it(`should set the animation to undefined to re-display the loader`, () => {
      expect(loaderService.fadeOut).toBeUndefined();
    });

    it(`should set the active flag to false when the subscription is ended`, () => {
      if (subscription) { subscription.unsubscribe(); }
      expect(loaderService.isActive()).toBeFalsy();
    });

    it(`should set the animation to fadeOut when the subscription is ended`, () => {
      if (subscription) {
        subscription.unsubscribe();
        loaderService.isActive();
      }
      expect(loaderService.fadeOut).toBe('fadeOut');
    });
  });

  describe('setSubscriber() | isActive() more than 1 subscription', () => {
    let subscription1: Subscription;
    let subscription2: Subscription;
    let subject = new Subject<any>();
    let subject2 = new Subject<any>();

    beforeEach(async(() => {
      subscription1 = subject.subscribe((something) => {
        return something;
      });
      subscription2 = subject2.subscribe((something) => {
        return something;
      });
      loaderService.setSubscribers([subscription1, subscription2]);
    }));

    it(`should set the active flag to true`, () => {
      expect(loaderService.isActive()).toBeTruthy();
    });

    it(`should set the animation to undefined to re-display the loader`, () => {
      expect(loaderService.fadeOut).toBeUndefined();
    });

    it(`should set the active flag to false when all of the subscriptions are ended`, () => {
      if (subscription1) { subscription1.unsubscribe(); }
      if (subscription2) { subscription2.unsubscribe(); }
      expect(loaderService.isActive()).toBeFalsy();
    });

    it(`should set the animation to fadeOut when all of the subscriptions are ended`, () => {
      if (subscription1) { subscription1.unsubscribe(); }
      if (subscription2) { subscription2.unsubscribe(); }
      loaderService.isActive();
      expect(loaderService.fadeOut).toBe('fadeOut');
    });
  });
});
