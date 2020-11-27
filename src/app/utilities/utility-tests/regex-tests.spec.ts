import { CommonDefinition } from '../common.definition';


describe(`Common RegExp Tests`, () => {
    describe('REGEX_IP_PATTERN', () => {
        it('should detect a match given valid ip address input', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_IP_PATTERN);
            let sampleInput = '10.1.1.1';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeTruthy();
        });

        it('should not return a match given inavlid ip address network ids', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_IP_PATTERN);
            let sampleInput = '258.330.1.1';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeFalse();
        });

        it('should not return a match given inavlid ip address string', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_IP_PATTERN);
            let sampleInput = 'invalid string test';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeFalse();
        });
    });

    describe('REGEX_IP_PATTERN_SHORTHAND_MASK', () => {
        it('should detect a match given valid shorthand mask input', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_IP_PATTERN_SHORTHAND_MASK);
            let sampleInput = '10.1.1.1/32';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeTruthy();
        });

        it('should still detect a match given valid ip address without mask input', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_IP_PATTERN_SHORTHAND_MASK);
            let sampleInput = '10.1.1.1';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeTruthy();
        });

        it('should not detect a match given invalid shorthand mask input', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_IP_PATTERN_SHORTHAND_MASK);
            let sampleInput = '10.1.1.1/33';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeFalse();
        });

        it('should not detect a match given invalid shorthand mask string', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_IP_PATTERN_SHORTHAND_MASK);
            let sampleInput = 'invalid string test';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeFalse();
        });
    });

    describe('REGEX_MOBILE_NUMBER_PATTERN', () => {
        it('should detect a match given valid mobile number with country code input', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN);
            let sampleInput = '+63912345678';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeTruthy();
        });

        it('should detect a match given valid mobile number that starts with zero input', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN);
            let sampleInput = '01234567891';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeTruthy();
        });

        it('should detect a match given valid 10 digit mobile number input', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN);
            let sampleInput = '1234567890';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeTruthy();
        });

        it('should not detect a match given invalid mobile number input', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN);
            let sampleInput = '1234567';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeFalse();
        });

        it('should not detect a match given invalid mobile number string', () => {
            const ipRegex = new RegExp(CommonDefinition.REGEX_MOBILE_NUMBER_PATTERN);
            let sampleInput = 'invalid string test';
            let result = ipRegex.test(sampleInput);
            expect(result).toBeFalse();
        });

        // TO DO: Add Other Regexp here
    });
});
