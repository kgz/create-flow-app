#!/usr/bin/env node
const yargs = require('yargs');
const fs = require('node:fs');
const prompts = require('prompts');

/**
 * @param {String} source 
 * @returns {Promise<Array<String>>}
 */
const getDirectories = async source =>
	(await fs.promises.readdir(source, { withFileTypes: true }))
		.filter(dirent => dirent.isDirectory())
		.map(dirent => dirent.name)


/** @return {Promise<{"projectName": String, "template": String}>} */
const getProjectConfig = async () => {
	/** @type {String|null|undefined} */
	let projectName = yargs.argv.name;

	/** @type {String|null|undefined} */
	let template = yargs.argv.template;

	if (!projectName) {
		const response = await prompts({
			type: 'text',
			name: 'value',
			message: 'Project Path',
			initial: 'myapp'//process.cwd().split("/").at(-1)
		});

		if (!(projectName = response.value)) {
			console.log("Setup Cancelled")
			process.exit()
		}
	}

	if (!template) {
		const options = await getDirectories(__dirname + "/templates/")
		const response = await prompts(
			{
				type: 'select',
				name: 'template',
				message: 'Pick a template',
				choices: options.map(val => ({ title: val, value: val }))
			}
		);

		if (!(template = response.template)) {
			console.log("Setup Cancelled")
			process.exit()
		}
	}

	return { projectName, template };
};

const mkDir = (path) => {
	try {
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	} catch (err) {
		console.error(err);
		process.exit()
	}
}

const main = async () => {
	// get config
	const { projectName, template } = await getProjectConfig();

	// make the project dir 
	mkDir(projectName)

	// copy selected template
	fs.cpSync(__dirname + "/templates/" + template, projectName, { recursive: true });

	// rename package name to projectName - probably needs to be something else as projectName can be a path
	fs.readFile(projectName + '/package.json', function (err, data) {
		if (err) throw err;
		const packageJson = JSON.parse(data);
		packageJson.name = projectName
		fs.writeFileSync(projectName + '/package.json', JSON.stringify(packageJson, null, 4));
	});
};

main().catch(console.error);



