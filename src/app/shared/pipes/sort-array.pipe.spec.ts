import { SortArrayPipe } from "./sort-array.pipe";

describe("SortArrayPipe", () => {
    let sortPipe;
    beforeEach(() => {
        sortPipe = new SortArrayPipe();
    });

    it("should return the sorted numeric array", () => {
        expect(sortPipe.transform([2, 4, 1, 3])).toEqual([1, 2, 3, 4]);
    });


    it("should return the sorted array object", () => {
        let arrayToSort: {name: string, age: number}[] = [
            {name: "Larry", age: 10},
            {name: "Aubrey", age: 6},
            {name: "Freddy", age: 5}
        ];
        let arrayInOrder: {name: string, age: number}[] = [
            {name: "Freddy", age: 5},
            {name: "Aubrey", age: 6},
            {name: "Larry", age: 10}
        ];
        let sortFunc = (a, b) => {
            if (a.age > b.age) {
              return 1;
            } else if (a.age < b.age) {
              return -1;
            }
            return 0;
          };

        expect(sortPipe.transform(arrayToSort, sortFunc)).toEqual(arrayInOrder);
    });

    it("should return an empty array if the value is null", () => {
        expect(sortPipe.transform(null)).toEqual([])
    });
})