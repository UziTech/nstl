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

	describe("add", () => {
		runTest("npm", ["install", "p1", "p2"], ["p1", "p2"]);
		runTest("npm", ["install", "p1", "p2"], ["add", "p1", "p2"]);
		runTest("yarn", ["add", "p1", "p2"], ["p1", "p2"], yarnLock);
		runTest("yarn", ["add", "p1", "p2"], ["add", "p1", "p2"], yarnLock);
		runTest("pnpm", ["add", "p1", "p2"], ["p1", "p2"], pnpmLock);
		runTest("pnpm", ["add", "p1", "p2"], ["add", "p1", "p2"], pnpmLock);
	});

	describe("install", () => {
		runTest("npm", ["install", "p1", "p2"], ["i", "p1", "p2"]);
		runTest("npm", ["install", "p1", "p2"], ["install", "p1", "p2"]);
		runTest("yarn", ["install", "p1", "p2"], ["i", "p1", "p2"], yarnLock);
		runTest("yarn", ["install", "p1", "p2"], ["install", "p1", "p2"], yarnLock);
		runTest("pnpm", ["install", "p1", "p2"], ["i", "p1", "p2"], pnpmLock);
		runTest("pnpm", ["install", "p1", "p2"], ["install", "p1", "p2"], pnpmLock);
	});

	describe("remove", () => {
		runTest("npm", ["uninstall", "p1", "p2"], ["un", "p1", "p2"]);
		runTest("npm", ["uninstall", "p1", "p2"], ["uninstall", "p1", "p2"]);
		runTest("npm", ["uninstall", "p1", "p2"], ["remove", "p1", "p2"]);
		runTest("yarn", ["remove", "p1", "p2"], ["un", "p1", "p2"], yarnLock);
		runTest("yarn", ["remove", "p1", "p2"], ["uninstall", "p1", "p2"], yarnLock);
		runTest("yarn", ["remove", "p1", "p2"], ["remove", "p1", "p2"], yarnLock);
		runTest("pnpm", ["remove", "p1", "p2"], ["un", "p1", "p2"], pnpmLock);
		runTest("pnpm", ["remove", "p1", "p2"], ["uninstall", "p1", "p2"], pnpmLock);
		runTest("pnpm", ["remove", "p1", "p2"], ["remove", "p1", "p2"], pnpmLock);
	});
});
