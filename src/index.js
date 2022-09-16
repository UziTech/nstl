const { spawnSync } = require("node:child_process");
const { existsSync } = require("node:fs");

function pnpm({command, options, packages}) {
	if (command === "add" && packages.length === 0) {
		command = "install";

		const optionMap = {
			"--no-dev": "--prod",
			"--no-optional": "--no-optional",
			"--no-peer": () => {
				// eslint-disable-next-line no-console
				console.log("PNPM does not install peer dependencies.");
			},
		};

		options = options.map(getAlias(optionMap));
	} else {
		const optionMap = {
			"--dev": "--save-dev",
			"--optional": "--save-optional",
			"--peer": "--save-peer",
			"--exact": "--save-exact",
			"--tilde": () => {
				// eslint-disable-next-line no-console
				console.error("PNPM doesn't have a --tilde option. You will have to manually edit the dependency version.");
				return "--save-exact";
			},
		};

		options = options.map(getAlias(optionMap));
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

	const optionMap = {
		"--global": () => {
			throw new Error("Yarn doesn't install global dependencies.");
		},
	};

	options = options.map(getAlias(optionMap));

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
		"--no-dev": "--omit dev",
		"--optional": "--save-optional",
		"--no-optional": "--omit optional",
		"--peer": () => {
			// eslint-disable-next-line no-console
			console.error("NPM doesn't have a --save-peer option. Dependencies will be installed but not saved.");
			return "--no-save";
		},
		"--no-peer": "--omit peer",
		"--exact": "--save-exact",
		"--tilde": () => {
			// eslint-disable-next-line no-console
			console.error("NPM doesn't have a --tilde option. You will have to manually edit the dependency version.");
			return "--save-exact";
		},
	};

	command = getAlias(commandMap, command);

	options = options.map(getAlias(optionMap));

	const args = [command, ...options, ...packages];

	return {
		command: "npm",
		args,
	};
}

function getAlias(aliases, selection) {
	function curry(prop) {
		const alias = aliases[prop];
		if (!(prop in aliases)) {
			// no alias return selection
			return prop;
		}

		if (typeof alias === "function") {

			return alias();
		}

		return alias;
	}

	if (selection) {
		return curry(selection);
	}

	return curry;
}

const cmdAlias = {
	"add": ["add", "install", "i"],
	"remove": ["uninstall", "un", "remove"],
};

const optAliases = {
	"--dev": ["--save-dev", "--dev", "-D"],
	"--no-dev": ["--no-dev", "--ignore-dev"],
	"--optional": ["--save-optional", "--optional", "-O"],
	"--no-optional": ["--no-optional", "--ignore-optional"],
	"--peer": ["--save-peer", "--peer", "-P"],
	"--no-peer": ["--no-peer", "--ignore-peer"],
	"--exact": ["--save-exact", "--exact", "-E"],
	"--tilde": ["--save-tilde", "--tilde", "-T"],
	"--global": ["--global", "-g"],
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
				i--;
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
	const filteredArgs = args.filter(Boolean);

	// eslint-disable-next-line no-console
	console.log(`\n${command} ${filteredArgs.join(" ")}\n`);
	spawnSync(command, filteredArgs, { shell: true, stdio: "inherit" });
};
