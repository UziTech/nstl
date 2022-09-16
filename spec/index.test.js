jest.mock("node:child_process");
jest.mock("node:fs");
const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
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

	describe("install", () => {
		for (const cmd of ["add", "install", "i"]) {
			runTest("npm", ["install", "p1", "p2"], [cmd, "p1", "p2"]);
			runTest("yarn", ["add", "p1", "p2"], [cmd, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "p1", "p2"], [cmd, "p1", "p2"], pnpmLock);
			runTest("npm", ["install"], [cmd]);
			runTest("yarn", ["install"], [cmd], yarnLock);
			runTest("pnpm", ["install"], [cmd], pnpmLock);
		}
	});

	describe("remove", () => {
		for (const cmd of ["uninstall", "un", "remove"]) {
			runTest("npm", ["uninstall", "p1", "p2"], [cmd, "p1", "p2"]);
			runTest("yarn", ["remove", "p1", "p2"], [cmd, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "p1", "p2"], [cmd, "p1", "p2"], pnpmLock);
		}
	});

	describe("--dev", () => {
		for (const opt of ["--save-dev", "--dev", "-D"]) {
			runTest("npm", ["install", "--save-dev", "p1", "p2"], ["i", opt, "p1", "p2"]);
			runTest("yarn", ["add", "--dev", "p1", "p2"], ["i", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "--save-dev", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--save-dev", "p1", "p2"], ["un", opt, "p1", "p2"]);
			runTest("yarn", ["remove", "--dev", "p1", "p2"], ["un", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "--save-dev", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--save-dev"], ["i", opt]);
			runTest("yarn", ["install", "--dev"], ["i", opt], yarnLock);
			runTest("pnpm", ["install", "--dev"], ["i", opt], pnpmLock);
		}
	});

	describe("--exact", () => {
		for (const opt of ["--save-exact", "--exact", "-E"]) {
			runTest("npm", ["install", "--save-exact", "p1", "p2"], ["i", opt, "p1", "p2"]);
			runTest("yarn", ["add", "--exact", "p1", "p2"], ["i", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "--save-exact", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--save-exact", "p1", "p2"], ["un", opt, "p1", "p2"]);
			runTest("yarn", ["remove", "--exact", "p1", "p2"], ["un", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "--save-exact", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--save-exact"], ["i", opt]);
			runTest("yarn", ["install", "--exact"], ["i", opt], yarnLock);
			runTest("pnpm", ["install", "--exact"], ["i", opt], pnpmLock);
		}
	});

	describe("--dev --exact", () => {
		runTest("npm", ["install", "--save-dev", "--save-exact"], ["i", "--dev", "--exact"]);
		runTest("yarn", ["install", "--dev", "--exact"], ["i", "--dev", "--exact"], yarnLock);
		runTest("pnpm", ["install", "--dev", "--exact"], ["i", "--dev", "--exact"], pnpmLock);
	});

	describe("--optional", () => {
		for (const opt of ["--save-optional", "--optional", "-O"]) {
			runTest("npm", ["install", "--save-optional", "p1", "p2"], ["i", opt, "p1", "p2"]);
			runTest("yarn", ["add", "--optional", "p1", "p2"], ["i", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "--save-optional", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--save-optional", "p1", "p2"], ["un", opt, "p1", "p2"]);
			runTest("yarn", ["remove", "--optional", "p1", "p2"], ["un", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "--save-optional", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--save-optional"], ["i", opt]);
			runTest("yarn", ["install", "--optional"], ["i", opt], yarnLock);
			runTest("pnpm", ["install", "--optional"], ["i", opt], pnpmLock);
		}
	});

	describe("--peer", () => {
		for (const opt of ["--save-peer", "--peer", "-P"]) {
			runTest("npm", ["install", "--no-save", "p1", "p2"], ["i", opt, "p1", "p2"]);
			runTest("yarn", ["add", "--peer", "p1", "p2"], ["i", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "--save-peer", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--no-save", "p1", "p2"], ["un", opt, "p1", "p2"]);
			runTest("yarn", ["remove", "--peer", "p1", "p2"], ["un", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "--save-peer", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--no-save"], ["i", opt]);
			runTest("yarn", ["install", "--peer"], ["i", opt], yarnLock);
			runTest("pnpm", ["install", "--peer"], ["i", opt], pnpmLock);
		}
	});
});
