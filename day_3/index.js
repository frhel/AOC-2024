// ************ Initalization Stuff ************
import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// Define Generic Global Variables
const _DAY = '03';

const _EXAMPLE = 0; // 0 for problem input, 1 for example

const _FILES = {'problem': 'in.txt', 'example': 'ex.txt'};
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''};
const _STARS = {'filled': '★', 'empty': '☆'};
_STARS.line_short = _STARS.filled.repeat(20);
_STARS.line_long = _STARS.filled.repeat(56);

let _ANSWERS = {
	'part_1': '**-',
	'part_2': '**-'
}

printDayTitlePlate(_DAY);

// Read the input file
let input = readInputFile();
// ************ End of Initalization ***********


// ************ Main Logic Stuff ************
let _CALC = true;
let data = parseInput(input);
log_answer(solvePart1(data), 1);
log_answer(solvePart2(data), 2);
printTotalTime();

// ************ Solution Functions ************
/**
 * Solves part 1 of the challenge
 * @param {Array} data - The parsed input data
 * @returns {Number} - The answer to the challenge
 */
function solvePart1(data) {
	_TIMERS.part_1 = performance.now();

	return data.reduce((acc, item) => {
		if (item === 'do()' || item === 'don\'t()') {
			return acc;
		}
		return acc + item[0] * item[1];
	}, 0);
}

/**
 * Solves part 2 of the challenge
 * @param {Array} data - The parsed input data
 * @returns {Number} - The answer to the challenge
 */
function solvePart2(data) {
	_TIMERS.part_2 = performance.now();

	return data.reduce((acc, item) => {
		if (item === 'do()' || item === 'don\'t()') {
			_CALC = item === 'do()' ? true : false;
		} else if (_CALC) {
			acc += item[0] * item[1];
		}
		return acc;
	}, 0)
}


/**
 * Parse the input into a usable format
 * @param {String} input - The input as a string
 * @returns {Array} - The parsed input
 */
function parseInput(input) {
	let regex = /mul[(]{1}[0-9]+,[0-9]+[)]{1}|do\(\)|don\'t\(\)/g;
	return input.match(regex)
				.map((line) => {
					if (line === 'do()' || line === 'don\'t()') {
						return line;
					}
					let [a, b] = line.match(/[0-9]+/g);
					return [parseInt(a), parseInt(b)];
				});
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
		.readFileSync(_EXAMPLE === 0 ? _FILES.problem : _FILES.example)
		.toString()
}

/**
 * Log the answer to the console
 * @param {Number} answer - The answer to log
 * @param {Number} part - The part of the _DAY
 */
function log_answer(answer, part) {
	console.info(chalk.blue(_STARS.line_short), ' '.repeat(3), chalk.bold.white('Part ' + part), ' '.repeat(3), chalk.blue(_STARS.line_short));
	console.info(_STARS.filled.repeat(2), chalk.cyan('Answer: '), chalk.yellow.bold('[-',answer,'-]'), 'in', chalk.green('[-'), chalk.green.bold((performance.now() - _TIMERS[`part_${part}`]).toFixed(4)), chalk.red('ms'), chalk.green('-]'));
	console.info(chalk.blue(_STARS.line_long), '\n');
}

/**
 * Print the day title plate to the console
 * @param {String} day - The day of the challenge
 */
function printDayTitlePlate(day) {
	console.info(chalk.blue(`\n${_STARS.line_long}`));
	console.info(chalk.blue(`${_STARS.line_short} ${chalk.bold.white('DAY .-[',_DAY,']-.')} ${_STARS.line_short}`));
	console.info(chalk.blue(`${_STARS.line_long}\n`));
}

/**
 * Print the total time to the console
 */
function printTotalTime() {
	console.info(chalk.blue(_STARS.line_short), ' '.repeat(1), chalk.bold.white('Total Time'), ' '.repeat(1), chalk.blue(_STARS.line_short));
	console.info(chalk.blue(_STARS.filled.repeat(23)), chalk.green.bold((performance.now() - _TIMERS['global']).toFixed(4))+chalk.bold.white('ms'), chalk.blue(_STARS.filled.repeat(23)));
	console.info(chalk.blue(_STARS.line_long));
}
// ************ End of Helper Functions ************
