import { expect } from "chai";
import { generateGaddagWords } from "../utils/read-words";

describe("Gaddag", function () {
  describe("generate gaddag from word", function () {
    it("should find a word after its added", function () {
      const gaddags = generateGaddagWords("explain");
      expect(gaddags).deep.equal([
        "e+xplain",
        "xe+plain",
        "pxe+lain",
        "lpxe+ain",
        "alpxe+in",
        "ialpxe+n",
        "nialpxe",
      ]);
    });
  });
});
