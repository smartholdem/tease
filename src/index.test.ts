import { main } from "./index";

describe("tease", () => {
	it("should export a main function", () => {
		expect(main).toBeInstanceOf(Function);
	});
});
