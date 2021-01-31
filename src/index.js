const { execSync } = require("child_process");
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
	command = command.trim();

	// eslint-disable-next-line no-console
	console.log(`\n${command}`);
	execSync(command.trim(), { stdio: "inherit" });
};
