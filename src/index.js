const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");

function pnpm({command, options, packages}) {
	if (command === "add" && packages.length === 0) {
		command = "install";
	}

	if (command === "add" || command === "remove") {
		const optionMap = {
			"--dev": "--save-dev",
			"--exact": "--save-exact",
		};

		options = options.map(opt => optionMap[opt]);
	}

	const args = [command, ...options, ...packages];

	return {
		command: "pnpm",
		args,
	};
}

function yarn({command, options, packages}) {
	if (command === "add" && packages.length === 0) {
		command = "install";
	}

	const args = [command, ...options, ...packages];

	return {
		command: "yarn",
		args,
	};
}

function npm({command, options, packages}) {
	const commandMap = {
		"add": "install",
		"remove": "uninstall",
	};

	const optionMap = {
		"--dev": "--save-dev",
		"--exact": "--save-exact",
	};

	command = commandMap[command];

	options = options.map(opt => optionMap[opt]);

	const args = [command, ...options, ...packages];

	return {
		command: "npm",
		args,
	};
}

const cmdAlias = {
	"add": ["add", "install", "i"],
	"remove": ["uninstall", "un", "remove"],
};

const optAliases = {
	"--dev": ["--save-dev", "--dev", "-D"],
	"--exact": ["--save-exact", "--exact", "-E"],
};

function parseArgs(argv) {
	let command;

	if (argv.length === 0) {
		command = "add";
	} else {
		for (const cmd in cmdAlias) {
			const aliases = cmdAlias[cmd];
			if (aliases.includes(argv[0])) {
				command = cmd;
				argv.shift();
				break;
			}
		}
	}

	if (!command) {
		command = "add";
	}

	const options = [];
	for (let i = 0; i < argv.length; i++) {
		for (const opt in optAliases) {
			const aliases = optAliases[opt];
			if (aliases.includes(argv[0])) {
				options.push(opt);
				argv.splice(i, 1);
				// i--;
				break;
			}
		}
	}

	const packages = [...argv];

	return {
		command,
		options,
		packages,
	};
}

const lockFiles = {
	"yarn.lock": yarn,
	"pnpm-lock.yaml": pnpm,
};

module.exports = (argv) => {
	let func;
	for (const file in lockFiles) {
		if (existsSync(file)) {
			func = lockFiles[file];
			break;
		}
	}
	if (!func) {
		func = npm;
	}

	const {command, args} = func(parseArgs(argv));

	// eslint-disable-next-line no-console
	console.log(`\n${command} ${args.join(" ")}\n`);
	spawnSync(command, args, { shell: true, stdio: "inherit" });
};
