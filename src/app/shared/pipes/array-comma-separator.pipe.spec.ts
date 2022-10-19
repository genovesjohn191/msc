

import { ArrayCommaSeparatorPipe } from "./array-comma-separator.pipe";

describe("ArrayCommaSeparatorPipe", () => {

  it(`should display the comma separated values`, () => {
    let pipe = new ArrayCommaSeparatorPipe();

    expect(pipe.transform(['one', 'two', 'three'])).toEqual("one, two, three");
    
  });

  it(`should display the value without a comma`, () => {
    let pipe = new ArrayCommaSeparatorPipe();

    expect(pipe.transform(['one'])).toEqual("one");
    
  });

  it(`should display empty string if the value is null`, () => {
    let pipe = new ArrayCommaSeparatorPipe();

    expect(pipe.transform(null)).toEqual("");
    
  });
})