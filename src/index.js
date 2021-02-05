const { spawnSync } = require("child_process");
const { existsSync } = require("fs");

function yarn(argv) {
	let command;
	if (isCommand("add", argv)) {
		command = "add";
		argv.shift();
	} else if (isCommand("install", argv)) {
		command = "install";
		argv.shift();
	} else if (isCommand("remove", argv)) {
		command = "remove";
		argv.shift();
	} else {
		command = argv.length === 0 ? "install" : "add";
	}
	argv.unshift(command);

	return {
		command: "yarn",
		args: argv,
	};
}

function pnpm(argv) {
	let command;
	if (isCommand("add", argv)) {
		command = "add";
		argv.shift();
	} else if (isCommand("install", argv)) {
		command = "install";
		argv.shift();
	} else if (isCommand("remove", argv)) {
		command = "remove";
		argv.shift();
	} else {
		command = argv.length === 0 ? "install" : "add";
	}
	argv.unshift(command);

	return {
		command: "pnpm",
		args: argv,
	};
}

function npm(argv) {
	let command;
	if (isCommand("add", argv)) {
		command = "install";
		argv.shift();
	} else if (isCommand("install", argv)) {
		command = "install";
		argv.shift();
	} else if (isCommand("remove", argv)) {
		command = "uninstall";
		argv.shift();
	} else {
		command = "install";
	}
	argv.unshift(command);

	return {
		command: "npm",
		args: argv,
	};
}

function isCommand(command, argv) {
	const aliasCommands = {
		"add": ["add", ""],
		"install": ["install", "i"],
		"remove": ["uninstall", "un", "remove"],
	};

	return argv.length > 0 && aliasCommands[command].includes(argv[0]);
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
