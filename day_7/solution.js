// ************ Initalization Stuff ************
import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output
import { Worker, isMainThread } from 'worker_threads'; // Worker threads for multi-threading

// Define Generic Global Variables
const _DAY = '07'; // Auto-generated by create.sh script. See README.md for details: https://github.com/frhel/AOC-2024/blob/main/README.md

const _FILE = process.argv[2] || 'in.txt'; // Default input file0 for problem input, 1 for example. Default is 1 for example
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''}; // Object to keep track of individual timers
const _OUTPUT_LENGTH = 60; // The length of the output line

printDayTitlePlate(_DAY); // Print a plate with the day of the challenge

// ************ End of Initalization ***********

// ************ Main Logic Stuff ************
let _REJECTS = []; // Array to hold all the rejects from part 1
let _OPERATORS = ['+', '*']; // The operators to use in the calculations
let _PART_1_ANSWER = 0; // The answer to part 1
let _PART_2_ANSWER = 0; // The answer to part 2
let _THREAD_COUNT = 5; // The number of threads to use
let input = readInputFile();
let data = parseInput(input);
await solvePart1(data); // Solve part 1 - Wait for the promise to resolve
await solvePart2(data); // Solve part 2 - Wait for the promise to resolve
printTotalTime();


// ************ Solution Functions ************
/**
 * Solves part 1 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
async function solvePart1(data) {
	_TIMERS.part_1 = performance.now(); // Start the timer for part 1

	// Launch the workers to solve the problem
	let workers = launchWorkers(data, 1);

	// Wait for all the workers to resolve
	await Promise.all(workers);

	log_answer(_PART_1_ANSWER, 1);
}

/**
 * Solves part 2 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
async function solvePart2(data) {
	_TIMERS.part_2 = performance.now(); // Start the timer for part 2

	// Set the operators for part 2
	_OPERATORS = ['+', '*', '||'];
	// Flatten the rejects array. This is necessary because the rejects are stored in an array of arrays
	// The workers return an array of rejects for each chunk of data they process
	_REJECTS = _REJECTS.flat();

	// Launch the workers to solve the problem
	let workers = launchWorkers(_REJECTS, 2);


	await Promise.all(workers);
	// Add the answer from part 1 to the answer from part 2
	log_answer(_PART_2_ANSWER + _PART_1_ANSWER, 2);
}

function updateAnswer(result, part) {
	if (part === 1) _PART_1_ANSWER += result;
	else _PART_2_ANSWER += result;
}

function launchWorkers(data, part) {
	// Define the workers array so we can push the workers to it
	let workers = [];
	let thread_count = _THREAD_COUNT;

	// Determine how many items each worker will process
	let chunk_size = Math.ceil(data.length / thread_count);

	// Launch the workers. Each worker processes chunk_size items from the data array
	for (let i = 0; i < thread_count * chunk_size; i += chunk_size) {
		workers.push(
			// Create a new promise for each worker so we can make sure all workers resolve before moving on
			new Promise((resolve, reject) => {
				// Slice the data array to get the chunk of data for this worker
				let worker_data = data.slice(i, i + chunk_size);
				// Create a new worker and pass the data and operators to it
				let worker = new Worker('./solve_chunk.js', { workerData: { data: worker_data, operators: _OPERATORS, part: part } });
				// Listen for messages from the worker
				worker.on('message', (msg) => {
					updateAnswer(msg.answer, part);
					// If part 1, add the rejects to the global rejects array
					// We have to add the rejects as an array of arrays because otherwise
					// we will have race conditions when multiple workers try to access the same array
					if (part === 1) _REJECTS.push([...msg.rejects]);
					resolve(); // Resolve the promise
				});
				worker.on('error', reject); // Reject the promise if there is an error
				worker.on('exit', (code) => {
					// If the worker exits with a non-zero code, reject the promise and log the error
					if (code !== 0)
						reject(new Error(`Worker stopped with exit code ${code}`));
				});
			}));
	}

	// Return the workers array so we can wait for all the workers to resolve
	return workers;
}



/**
 * Parse the input into a usable format
 * Remember to set the @param and @returns values
 */
function parseInput(input) {
	// Returns [test, [numbers]]
	return input.split('\n').map((line) => line.split(' ')).map((line) => [Number(line[0].split(':')[0]), [...line.slice(1)].map((el) => Number(el))]);

}
// ************ End of Solution Functions ************
// ************ End of Main Logic Stuff ************


// ************ Helper Functions ************
/**
 * Read the input file
 * @returns {String} - The input file as a string
 */
function readInputFile() {
	// Selector for input file is set by _EXAMPLE variable at the top
	return fs
		.readFileSync(_FILE)
		.toString()
}

function pickTimeUnit(time) {
	if (time < 1) return [time * 1000, 'µs'];
	else if (time < 1000) return [time, 'ms'];
	else if (time < 60000) return [time / 1000, 's'];
	else if (time < 3600000) return [time / 60000, 'm'];
	else return [time / 3600000, 'h'];
}

/**
 * Log the answer to the console
 * @param {Number} answer - The answer to log
 * @param {Number} part - The part of the _DAY
 */
function log_answer(answer, part) {
	let time = performance.now();
	time = time - _TIMERS[`part_${part}`];
	let time_unit = pickTimeUnit(time);
	let static_length = 31;
	let line_length = static_length + answer.toString().length + time_unit[0].toFixed(4).length;
	let output = chalk(chalk.bold.white('Part ' + part + ' [-'), chalk.yellow.bold(answer), chalk.white.bold('-] in'), chalk.green.bold('[- ' + (time_unit[0]).toFixed(4)), chalk.red(time_unit[1]), chalk.green.bold('-]'));
	console.info(chalk.bold.white('---'), output, chalk.bold.white('-'.repeat(Math.abs(_OUTPUT_LENGTH - line_length))));
	console.info(chalk.bold.blue('-'.repeat(_OUTPUT_LENGTH)));
}

/**
 * Print the day title plate to the console
 * @param {String} day - The day of the challenge
 */
function printDayTitlePlate(day) {
	console.log('\n');
	let title = `-= DAY ${day} =-`;
	let line_length = (_OUTPUT_LENGTH - (title.length) - 2) / 4;
	console.info(chalk.bold.blue('-'.repeat(_OUTPUT_LENGTH)));
	console.info(chalk.bold.blue('-'.repeat(Math.ceil(line_length)), `${chalk.bold.white(title)}`, '-'.repeat(line_length * 3)));
	console.info(chalk.bold.blue('-'.repeat(_OUTPUT_LENGTH)));
}

/**
 * Print the total time to the console
 */
function printTotalTime() {
	let time = performance.now();
	time = time - _TIMERS.global;
	let time_unit = pickTimeUnit(time);
	let static_length = 26;
	let line_length = static_length + time.toFixed(4).length;
	let output = chalk(chalk.bold.white('Total Time: [-'), chalk.green.bold(time_unit[0].toFixed(4), chalk.red(time_unit[1]), chalk.white('-]')));
	console.info(chalk.bold.white('---'), output, chalk.bold.white('-'.repeat(Math.abs(_OUTPUT_LENGTH - line_length))));
	console.info(chalk.bold.blue('-'.repeat(_OUTPUT_LENGTH)));
	console.log('\n');
}
// ************ End of Helper Functions ************
