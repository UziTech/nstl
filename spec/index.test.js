jest.mock("node:child_process");
jest.mock("node:fs");
const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");
const nstl = require("../");

function getResultString(command, args) {
	if (args instanceof Error) {
		if (args.message) {
			return `Error("${args.message}")`;
		}

		return "Error";
	}

	return `${command} ${args.filter(Boolean).join(" ")}`.trim();
}

function runTest(command, args, argv = [], file = null) {
	const nstlCmd = `nstl ${argv.filter(Boolean).join(" ")}`.trim();
	const result = getResultString(command, args);
	test(`${nstlCmd} -> ${result}`, () => {
		if (file) {
			existsSync.mockImplementation((f) => {
				return f.match(file) !== null;
			});
		}

		if (args instanceof Error) {
			let undef;
			expect(() => {
				nstl(argv);
			}).toThrow(args.message ? args : undef);
			return;
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
		jest.spyOn(console, "error").mockImplementation(() => {});
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

	describe("--no-dev", () => {
		for (const opt of ["--no-dev", "--ignore-dev"]) {
			runTest("npm", ["install", "--omit dev", "p1", "p2"], ["i", opt, "p1", "p2"]);
			runTest("yarn", ["add", "--no-dev", "p1", "p2"], ["i", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "--no-dev", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--omit dev", "p1", "p2"], ["un", opt, "p1", "p2"]);
			runTest("yarn", ["remove", "--no-dev", "p1", "p2"], ["un", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "--no-dev", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--omit dev"], ["i", opt]);
			runTest("yarn", ["install", "--no-dev"], ["i", opt], yarnLock);
			runTest("pnpm", ["install", "--prod"], ["i", opt], pnpmLock);
		}
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

	describe("--no-optional", () => {
		for (const opt of ["--no-optional", "--ignore-optional"]) {
			runTest("npm", ["install", "--omit optional", "p1", "p2"], ["i", opt, "p1", "p2"]);
			runTest("yarn", ["add", "--no-optional", "p1", "p2"], ["i", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "--no-optional", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--omit optional", "p1", "p2"], ["un", opt, "p1", "p2"]);
			runTest("yarn", ["remove", "--no-optional", "p1", "p2"], ["un", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "--no-optional", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--omit optional"], ["i", opt]);
			runTest("yarn", ["install", "--no-optional"], ["i", opt], yarnLock);
			runTest("pnpm", ["install", "--no-optional"], ["i", opt], pnpmLock);
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

	describe("--no-peer", () => {
		for (const opt of ["--no-peer", "--ignore-peer"]) {
			runTest("npm", ["install", "--omit peer", "p1", "p2"], ["i", opt, "p1", "p2"]);
			runTest("yarn", ["add", "--no-peer", "p1", "p2"], ["i", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "--no-peer", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--omit peer", "p1", "p2"], ["un", opt, "p1", "p2"]);
			runTest("yarn", ["remove", "--no-peer", "p1", "p2"], ["un", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "--no-peer", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--omit peer"], ["i", opt]);
			runTest("yarn", ["install", "--no-peer"], ["i", opt], yarnLock);
			runTest("pnpm", ["install"], ["i", opt], pnpmLock);
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

	describe("--tilde", () => {
		for (const opt of ["--save-tilde", "--tilde", "-T"]) {
			runTest("npm", ["install", "--save-exact", "p1", "p2"], ["i", opt, "p1", "p2"]);
			runTest("yarn", ["add", "--tilde", "p1", "p2"], ["i", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "--save-exact", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--save-exact", "p1", "p2"], ["un", opt, "p1", "p2"]);
			runTest("yarn", ["remove", "--tilde", "p1", "p2"], ["un", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "--save-exact", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--save-exact"], ["i", opt]);
			runTest("yarn", ["install", "--tilde"], ["i", opt], yarnLock);
			runTest("pnpm", ["install", "--tilde"], ["i", opt], pnpmLock);
		}
	});

	describe("--global", () => {
		for (const opt of ["--global", "-g"]) {
			runTest("npm", ["install", "--global", "p1", "p2"], ["i", opt, "p1", "p2"]);
			runTest("yarn", new Error("Yarn doesn't install global dependencies."), ["i", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["add", "--global", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--global", "p1", "p2"], ["un", opt, "p1", "p2"]);
			runTest("yarn", new Error("Yarn doesn't install global dependencies."), ["un", opt, "p1", "p2"], yarnLock);
			runTest("pnpm", ["remove", "--global", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--global"], ["i", opt]);
			runTest("yarn", new Error("Yarn doesn't install global dependencies."), ["i", opt], yarnLock);
			runTest("pnpm", ["install", "--global"], ["i", opt], pnpmLock);
		}
	});
});
