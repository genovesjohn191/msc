import {
  async,
  TestBed,
  getTestBed
} from '@angular/core/testing';
import { Component } from '@angular/core';
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
      providers: [ LoaderService ]
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      loaderService = getTestBed().get(LoaderService);
    });
  }));

  /** Test Implementation */
  describe('setSubscriber()', () => {
    let subscription: Subscription;
    let subject = new Subject<any>();

    beforeEach(async(() => {
      subscription = subject.subscribe((something) => {
        return something;
      });
      loaderService.setSubscriber(subscription);
    }));

    it(`should set the active flag to true`, () => {
      expect(loaderService.active).toBeTruthy();
    });

    it(`should set the active flag to false when the subscription is ended`, () => {
      if (subscription) { subscription.unsubscribe(); }
      expect(loaderService.active).toBeFalsy();
    });

    it(`should set the animation to fadeOut when the subscription is ended`, () => {
      if (subscription) { subscription.unsubscribe(); }
      expect(loaderService.animate).toBe('fadeOut');
    });
  });
});
