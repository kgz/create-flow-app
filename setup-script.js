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

const getProjectName = async () => {
	/** @type {String|null|undefined} */
	let projectName = yargs.argv.name;

	/** @type {String|null|undefined} */
	let template = yargs.argv.template;

	if (!projectName) {
		// const rl = createInterface();
		// projectName = await askQuestion(rl, 'Enter project name: ');
		// rl.close();

		const response = await prompts({
			type: 'text',
			name: 'value',
			message: 'Project Path',
			initial: process.cwd().split("/").at(-1)

			// validate: value => value
		});

		projectName = response.value
	}

	if (!template) {

		const options = await getDirectories("templates")
		console.log({ options })
		const response = await prompts(
			{
				type: 'select',
				name: 'template',
				message: 'Pick a template',
				choices: options.map(val => ({ title: val, value: val }))
			}
		);

		template = response.template;

		console.log(template)
	}

	return { projectName, template };
};


const readline = require('readline');

const createInterface = () => {
	return readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
};

const askQuestion = (rl, question) => {
	return new Promise((resolve) => {
		rl.question(question, (answer) => {
			resolve(answer);
		});
	});
};

const mkDir = (path) => {
	try {
		if (!fs.existsSync(path)) {
			fs.mkdirSync(path);
		}
	} catch (err) {
		console.error(err);
	}
}

const copyDir = () => {
	fs.cpSync(src, dest, { recursive: true });
}

const main = async () => {
	console.log(process.cwd(), __dirname);
	const { projectName, template } = await getProjectName();
	mkDir(projectName)
	fs.cpSync(__dirname + "/templates/" + template, projectName, { recursive: true });
	fs.readFile(projectName + '/package.json', function (err, data) {

		if (err) throw err;

		const pjson = JSON.parse(data);
		pjson.name = projectName
		fs.writeFileSync(projectName + '/package.json', JSON.stringify(pjson, null, 4));


	});
};

main().catch(console.error);



