import { browser, by, element } from 'protractor';

describe('App', () => {

  beforeEach(() => {
    browser.get('/');
  });

  it('should have a title', () => {
    let subject: any;
    browser.getTitle().then((value) => {
      subject = value;
    });
    let result  = 'Angular2 Webpack Starter by @gdi2290 from @AngularClass';
    expect(subject).toEqual(result);
  });

  it('should have header', () => {
    let subject: any;
    element(by.css('h1')).isPresent().then((value) => {
      subject = value;
    });
    let result  = true;
    expect(subject).toEqual(result);
  });

  it('should have <home>', () => {
    let subject: any;
    element(by.css('app home')).isPresent().then((value) => {
      subject = value;
    });
    let result  = true;
    expect(subject).toEqual(result);
  });

  it('should have buttons', () => {
    let subject: any;
    element(by.css('button')).getText().then((value) => {
      subject = value;
    });
    let result  = 'Submit Value';
    expect(subject).toEqual(result);
  });

});
