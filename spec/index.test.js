const index = require("../src/index.js");

describe("index", () => {
	test("should return undefined", () => {
		expect(index()).toBeUndefined();
	});
});
