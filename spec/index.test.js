jest.mock("child_process");
jest.mock("fs");
const { execSync } = require("child_process");
const { existsSync } = require("fs");
const nstl = require("../");

function runTest(expected, packages = [], file = null) {
	test(expected, () => {
		if (file) {
			existsSync.mockImplementation((f) => {
				return f.match(file) !== null;
			});
		}
		nstl(packages);
		expect(execSync).toHaveBeenCalledWith(expected, {stdio: "inherit"});
	});
}

describe("index", () => {
	beforeEach(() => {
		execSync.mockImplementation(() => {});
		existsSync.mockReset();
	});

	runTest("npm install");
	runTest("npm install p1 p2", ["p1", "p2"]);
	runTest("yarn", [], /yarn.lock$/);
	runTest("yarn add p1 p2", ["p1", "p2"], /yarn.lock$/);
	runTest("pnpm install", [], /pnpm-lock.yaml$/);
	runTest("pnpm install p1 p2", ["p1", "p2"], /pnpm-lock.yaml$/);
	runTest("pnpm install", [], /pnpm-lock.json$/);
	runTest("pnpm install p1 p2", ["p1", "p2"], /pnpm-lock.json$/);
});
