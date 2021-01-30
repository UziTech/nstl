const { spawn } = require("child_process");
const { existsSync } = require("fs");

const lockFiles = {
	"yarn.lock": (packages) => {
		let command = "yarn";
		if (packages.length > 0) {
			command += ` add ${packages.join(" ")}`;
		}
		return command;
	},

	"pnpm-lock.yaml": (packages) => `pnpm install ${packages.join(" ")}`,
	"pnpm-lock.json": "pnpm-lock.yaml",
};

module.exports = (packages) => {
	let command = `npm install ${packages.join(" ")}`;
	for (const file in lockFiles) {
		if (existsSync(file)) {
			let getCommand = lockFiles[file];
			if (typeof getCommand === "string") {
				getCommand = lockFiles[getCommand];
			}
			command = getCommand(packages);
		}
	}

	spawn(command.trim(), { stdio: "inherit" });
};
