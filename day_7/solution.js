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


const _USE_WORKERS = true; // Set to true to use workers for multi-threading


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

	if (_USE_WORKERS) {
		// Launch the workers to solve the problem
		let workers = launchWorkers(data, 1);
		// Wait for all the workers to resolve
		await Promise.all(workers);
	} else {
		_PART_1_ANSWER = solve(data, 1);
	}

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

	if (_USE_WORKERS) {
		// Flatten the rejects array. This is necessary because the rejects are stored in an array of arrays
		// The workers return an array of rejects for each chunk of data they process
		_REJECTS = _REJECTS.flat();
		// Launch the workers to solve the problem
		let workers = launchWorkers(_REJECTS, 2);
		await Promise.all(workers);
	} else {
 		_PART_2_ANSWER = solve(_REJECTS, 2);
	}


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
 * Executes solution code on a chunk of data
 * @param {Array} data - The data to process
 * @returns {Object} - The answer and rejects
 */
function solve(data, part) {
	let answer = 0;

	// For every equation in the data
	for (let eq of data) {
		// Recurse through the data and find if the test is possible or not
		let res = startNewRecursionBranches(eq[0], eq[1][0], eq[1][1], eq[1].slice(2), [part]);
		answer += res;
		// Any tests that return 0 are added to the rejects array but only for part 1
		// Part 2 will use the rejects array to solve the second part of the puzzle
		if (part === 1 && res === 0) _REJECTS.push(eq);
	}
	// Return JSON object with the answer and rejects to the main thread
	return answer;
}

/**
 * Recursively solve the equation with different operators to see which one will match the test
 * @param {Number} test - The test value to match
 * @param {Number} left - The left side of the current pair of numbers
 * @param {Number} right - The right side of the current pair of numbers
 * @param {Array} line - The rest of the numbers to process
 * @param {Number} part - The part of the puzzle we are solving
 * @returns {Number} - The result of the recursion
 */
function startNewRecursionBranches(test, left, right, line, part) {
	// Make sure we copy the line so we don't modify the original
	// for every branch of the recursion
	let new_line = line.slice(1);

	// Create a new branch for each operation
	for (let operator of _OPERATORS) {
		// Send the operation to the recursion handler
		let res = handleRecursion(test, left, right, line, new_line, part, operator);
		// If the result is the test, return it
		if (res === test) return res;
	}
	return 0;
}

/**
 * Handle the recursion for each branch of the equation
 * @param {Number} test - The test value to match
 * @param {Number} left - The left side of the current pair of numbers
 * @param {Number} right - The right side of the current pair of numbers
 * @param {Array} line - The rest of the numbers to process
 * @param {Array} new_line - A copy of the rest of the numbers to process
 * @param {Number} part - The part of the puzzle we are solving
 * @param {String} operator - The operator to use
 * @returns {Number} - The result of the recursion
 */
function handleRecursion(test, left, right, line, new_line, part, operator) {
	// Perform the operation on the left and right numbers
	let outcome = performOperation(operator, left, right);

	// If the outcome is greater than the test, kill the branch
	// as it is impossible to reach the test value
	if (outcome > test) return -1;
	// If the outcome is the test, return it as we have found a solution
	if (outcome === test) return outcome;

	// If there are more numbers left to process
	// recurse through the rest of them with the new outcome as the left side
	if (line.length > 0) {
		// Send the new outcome to the recursion initializer
		let res = startNewRecursionBranches(test, outcome, line[0], new_line, part);
		// If the result is the test, return it as we have found a solution
		if (res === test) return res;
	}
	return 0;
}

/**
 * Depending on the operator, perform the operation on the left and right numbers
 * @param {String} operator - The operator to use
 * @param {Number} left - The left side of the current pair of numbers
 * @param {Number} right - The right side of the current pair of numbers
 * @returns {Number} - The outcome of the operation
 */
function performOperation(operator, left, right) {
	let outcome = 0;
	if (operator === '+') outcome = left + right;
	else if (operator === '*') outcome = left * right;
	else if (operator === '||') outcome = concatNums(left, right);
	return outcome;
}

function concatNums(left, right) {
	let temp = right
	while (temp >= 1) {
		left = left * 10;
		temp = temp / 10;
	}
	return left + right;
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
