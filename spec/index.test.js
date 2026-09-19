const assert = require("node:assert/strict");
const childProcess = require("node:child_process");
const fs = require("node:fs");
const { afterEach, beforeEach, describe, mock, test } = require("node:test");

const rootModule = require.resolve("..");
const srcModule = require.resolve("../src/index.js");
const originalSpawnSync = childProcess.spawnSync;
const originalExistsSync = fs.existsSync;

function loadNstl(spawnSync, existsSync) {
	childProcess.spawnSync = spawnSync;
	fs.existsSync = existsSync;
	delete require.cache[rootModule];
	delete require.cache[srcModule];
	return require("..");
}

function runTest(command, args, argv = [], file = null) {
	const nstlCmd = `nstl ${argv.filter(Boolean).join(" ")}`.trim();
	const result = `${command} ${args.join(" ")}`.trim();

	test(`${nstlCmd} -> ${result}`, () => {
		const spawnSync = mock.fn(() => {});
		const existsSync = mock.fn((f) => {
			return file ? f.match(file) !== null : false;
		});
		const nstl = loadNstl(spawnSync, existsSync);

		nstl(argv);

		assert.deepEqual(console.log.mock.calls.at(-1).arguments, [
			`\n${command} ${args.join(" ")}\n`,
		]);
		assert.equal(spawnSync.mock.calls.length, 1);
		assert.deepEqual(spawnSync.mock.calls[0].arguments, [
			command,
			args,
			{
				shell: true,
				stdio: "inherit",
			},
		]);
	});
}

const yarnLock = /yarn.lock$/;
const pnpmLock = /pnpm-lock.yaml$/;

beforeEach(() => {
	mock.method(console, "log", () => {});
	mock.method(console, "error", () => {});
});

afterEach(() => {
	childProcess.spawnSync = originalSpawnSync;
	fs.existsSync = originalExistsSync;
	delete require.cache[rootModule];
	delete require.cache[srcModule];
	mock.restoreAll();
});

describe("index", () => {
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
			test(`nstl i ${opt} p1 p2 -> Yarn throws`, () => {
				const spawnSync = mock.fn(() => {});
				const existsSync = mock.fn((f) => {
					return f.match(yarnLock) !== null;
				});
				const nstl = loadNstl(spawnSync, existsSync);

				assert.throws(() => {
					nstl(["i", opt, "p1", "p2"]);
				}, /Yarn doesn't install global dependencies\./);
				assert.equal(spawnSync.mock.calls.length, 0);
			});
			runTest("pnpm", ["add", "--global", "p1", "p2"], ["i", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["uninstall", "--global", "p1", "p2"], ["un", opt, "p1", "p2"]);
			test(`nstl un ${opt} p1 p2 -> Yarn throws`, () => {
				const spawnSync = mock.fn(() => {});
				const existsSync = mock.fn((f) => {
					return f.match(yarnLock) !== null;
				});
				const nstl = loadNstl(spawnSync, existsSync);

				assert.throws(() => {
					nstl(["un", opt, "p1", "p2"]);
				}, /Yarn doesn't install global dependencies\./);
				assert.equal(spawnSync.mock.calls.length, 0);
			});
			runTest("pnpm", ["remove", "--global", "p1", "p2"], ["un", opt, "p1", "p2"], pnpmLock);
			runTest("npm", ["install", "--global"], ["i", opt]);
			test(`nstl i ${opt} -> Yarn throws`, () => {
				const spawnSync = mock.fn(() => {});
				const existsSync = mock.fn((f) => {
					return f.match(yarnLock) !== null;
				});
				const nstl = loadNstl(spawnSync, existsSync);

				assert.throws(() => {
					nstl(["i", opt]);
				}, /Yarn doesn't install global dependencies\./);
				assert.equal(spawnSync.mock.calls.length, 0);
			});
			runTest("pnpm", ["install", "--global"], ["i", opt], pnpmLock);
		}
	});
});
