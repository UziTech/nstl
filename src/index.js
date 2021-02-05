const { spawnSync } = require("child_process");
const { existsSync } = require("fs");

function yarn(argv) {
	let isInstall = argv.length === 0;
	if (argv.length > 0 && ["install", "i"].includes(argv[0])) {
		isInstall = true;
		argv.shift();
	}
	argv.unshift(isInstall ? "install" : "add");

	return {
		command: "yarn",
		args: argv,
	};
}

function pnpm(argv) {
	let isInstall = argv.length === 0;
	if (argv.length > 0 && ["install", "i"].includes(argv[0])) {
		isInstall = true;
		argv.shift();
	}
	argv.unshift(isInstall ? "install" : "add");

	return {
		command: "pnpm",
		args: argv,
	};
}

function npm(argv) {
	if (argv.length > 0 && ["install", "add", "i"].includes(argv[0])) {
		argv.shift();
	}
	argv.unshift("install");

	return {
		command: "npm",
		args: argv,
	};
}

const lockFiles = {
	"yarn.lock": yarn,
	"pnpm-lock.yaml": pnpm,
};

module.exports = (argv) => {
	let command, args;
	for (const file in lockFiles) {
		if (existsSync(file)) {
			({command, args} = lockFiles[file](argv));
			break;
		}
	}
	if (!command) {
		({command, args} = npm(argv));
	}

	// eslint-disable-next-line no-console
	console.log(`\n${command} ${args.join(" ")}\n`);
	spawnSync(command, args, { shell: true, stdio: "inherit" });
};
