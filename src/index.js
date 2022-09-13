const { spawnSync } = require("child_process");
const { existsSync } = require("fs");

function pnpm({command, options, packages}) {
	if (command === "add" && packages.length === 0) {
		command = "install";
	}

	options = options.map(opt => {
		if (packages.length > 0 && opt === "--dev") {
			return "--save-dev";
		}

		return opt;
	});

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
	if (command === "add") {
		command = "install";
	} else if (command === "remove") {
		command = "uninstall";
	}

	options = options.map(opt => {
		if (opt === "--dev") {
			return "--save-dev";
		}

		return opt;
	});

	const args = [command, ...options, ...packages];

	return {
		command: "npm",
		args,
	};
}

function parseArgs(argv) {
	let command;
	if (argv.length === 0) {
		command = "add";
	} else if (["uninstall", "un", "remove"].includes(argv[0])) {
		command = "remove";
		argv.shift();
	} else if (["", "add", "install", "i"].includes(argv[0])) {
		command = "add";
		argv.shift();
	} else {
		// no command
		command = "add";
	}

	const options = [];
	for (let i = 0; i < argv.length; i++) {
		if (["--save-dev", "--dev", "-D"].includes(argv[i])) {
			options.push("--dev");
			argv.splice(i, 1);
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
