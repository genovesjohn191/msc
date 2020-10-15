import {
  inject,
  waitForAsync,
  TestBed
} from '@angular/core/testing';

import { McsAssetsProvider } from '../../core';
import { CoreLayoutTestingModule } from '../testing';
import { FooterComponent } from './footer.component';

describe('FooterComponent', () => {

  /** Stub Services/Components */
  let component: FooterComponent;

  beforeEach(waitForAsync(() => {
    /** Testbed Reset Module */
    TestBed.resetTestingModule();

    /** Testbed Configuration */
    TestBed.configureTestingModule({
      declarations: [
        FooterComponent
      ],
      imports: [
        CoreLayoutTestingModule
      ]
    });

    /** Testbed Onverriding of Components */
    TestBed.overrideComponent(FooterComponent, {
      set: {
        template: `<div>FooterComponent Template</div>`
      }
    });

    /** Tesbed Component Compilation and Creation */
    TestBed.compileComponents().then(() => {
      let fixture = TestBed.createComponent(FooterComponent);
      fixture.detectChanges();

      component = fixture.componentInstance;
    });
  }));

  /** Test Implementation */
  describe('ngOnInit()', () => {
    it('should call the getImagePath() of AssetsProvider',
      inject([McsAssetsProvider], (assetsProvider: McsAssetsProvider) => {
        spyOn(assetsProvider, 'getImagePath');
        component.ngOnInit();
        expect(assetsProvider.getImagePath).toHaveBeenCalled();
      }));

    it('mcsLogo variable should not be equal to undefined, null, or empty',
      inject([McsAssetsProvider], (_assetsProvider: McsAssetsProvider) => {
        expect(component.mcsLogo).not.toEqual(undefined);
        expect(component.mcsLogo).not.toEqual(null);
        expect(component.mcsLogo).not.toEqual('');
      }));
  });
});
