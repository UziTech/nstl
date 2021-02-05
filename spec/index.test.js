jest.mock("child_process");
jest.mock("fs");
const { spawnSync } = require("child_process");
const { existsSync } = require("fs");
const nstl = require("../");

function runTest(command, args, packages = [], file = null) {
	test(`${command} ${args.join(" ")}`, () => {
		if (file) {
			existsSync.mockImplementation((f) => {
				return f.match(file) !== null;
			});
		}

		nstl(packages);

		// eslint-disable-next-line no-console
		expect(console.log).toHaveBeenCalledWith(`\n${command} ${args.join(" ")}\n`);
		expect(spawnSync).toHaveBeenCalledWith(command, args, {shell: true, stdio: "inherit"});
	});
}

describe("index", () => {
	beforeEach(() => {
		spawnSync.mockImplementation(() => {});
		existsSync.mockReset();
		jest.spyOn(console, "log").mockImplementation(() => {});
	});

	runTest("npm", ["install"]);
	runTest("npm", ["install", "-D"], ["i", "-D"]);
	runTest("npm", ["install", "-D"], ["add", "-D"]);
	runTest("npm", ["install", "-D"], ["install", "-D"]);
	runTest("npm", ["install", "p1", "p2"], ["p1", "p2"]);
	runTest("yarn", ["install"], [], /yarn.lock$/);
	runTest("yarn", ["install", "-D"], ["i", "-D"], /yarn.lock$/);
	runTest("yarn", ["install", "-D"], ["install", "-D"], /yarn.lock$/);
	runTest("yarn", ["add", "p1", "p2"], ["p1", "p2"], /yarn.lock$/);
	runTest("pnpm", ["install"], [], /pnpm-lock.yaml$/);
	runTest("pnpm", ["add", "p1", "p2"], ["p1", "p2"], /pnpm-lock.yaml$/);
	runTest("pnpm", ["install", "-D"], ["i", "-D"], /pnpm-lock.yaml$/);
	runTest("pnpm", ["install", "-D"], ["install", "-D"], /pnpm-lock.yaml$/);
});
