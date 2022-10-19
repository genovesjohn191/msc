import { StdCurrencyFormatPipe } from "./std-currency-format.pipe";

describe("StdCurrencyFormatPipe", () => {
    let currencyPipe;
    beforeEach(() => {
        currencyPipe = new StdCurrencyFormatPipe();
    });

    it("should return the value in standard currency format", () => {
        expect(currencyPipe.transform(100.5)).toEqual("$100.50")
    });

    it("should return zero in standard currency format if the value is null", () => {
        expect(currencyPipe.transform(null)).toEqual("$0.00")
    });
})