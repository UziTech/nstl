jest.mock("child_process");
jest.mock("fs");
const { spawnSync } = require("child_process");
const { existsSync } = require("fs");
const nstl = require("../");

function runTest(command, args, argv = [], file = null) {
	const nstlCmd = `nstl ${argv.filter(a => a).join(" ")}`.trim();
	const cmd = `${command} ${args.filter(a => a).join(" ")}`.trim();
	test(`${nstlCmd} -> ${cmd}`, () => {
		if (file) {
			existsSync.mockImplementation((f) => {
				return f.match(file) !== null;
			});
		}

		nstl(argv);

		// eslint-disable-next-line no-console
		expect(console.log).toHaveBeenCalledWith(`\n${command} ${args.join(" ")}\n`);
		expect(spawnSync).toHaveBeenCalledWith(command, args, {shell: true, stdio: "inherit"});
	});
}

const yarnLock = /yarn.lock$/;
const pnpmLock = /pnpm-lock.yaml$/;

describe("index", () => {
	beforeEach(() => {
		spawnSync.mockImplementation(() => {});
		existsSync.mockReset();
		jest.spyOn(console, "log").mockImplementation(() => {});
	});

	describe("no args", () => {
		runTest("npm", ["install"]);
		runTest("yarn", ["install"], [], yarnLock);
		runTest("pnpm", ["install"], [], pnpmLock);
	});

	describe("no command", () => {
		runTest("npm", ["install", "p1", "p2"], ["p1", "p2"]);
		runTest("yarn", ["add", "p1", "p2"], ["p1", "p2"], yarnLock);
		runTest("pnpm", ["add", "p1", "p2"], ["p1", "p2"], pnpmLock);
	});

	describe("add", () => {
		for (const cmd of ["add", ""]) {
			runTest("npm", ["install", "p1", "p2"], [cmd, "p1", "p2"]);
			runTest("yarn", ["add", "p1", "p2"], [cmd, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "p1", "p2"], [cmd, "p1", "p2"], pnpmLock);
		}
	});

	describe("install", () => {
		for (const cmd of ["install", "i"]) {
			runTest("npm", ["install", "p1", "p2"], [cmd, "p1", "p2"]);
			runTest("yarn", ["install", "p1", "p2"], [cmd, "p1", "p2"], yarnLock);
			runTest("pnpm", ["install", "p1", "p2"], [cmd, "p1", "p2"], pnpmLock);
		}
	});

	describe("remove", () => {
		for (const cmd of ["uninstall", "un", "remove"]) {
			runTest("npm", ["uninstall", "p1", "p2"], [cmd, "p1", "p2"]);
			runTest("yarn", ["remove", "p1", "p2"], [cmd, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "p1", "p2"], [cmd, "p1", "p2"], pnpmLock);
		}
	});
});
