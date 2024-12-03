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

let _ANSWERS = {'part_1': '**-','part_2': '**-'};

printDayTitlePlate(_DAY);

// Read the input file
let input = readInputFile();
// ************ End of Initalization ***********

// ************ Main Logic Stuff ************
let data = parseInput(input);
solvePart1(data);
solvePart2(data);
printTotalTime();

// ************ Solution Functions ************
/**
 * Solves part 1 of the challenge
 * @param {Array} data - The parsed input data
 * @returns {Number} - The answer to the challenge
 */
function solvePart1(data) {
	_TIMERS.part_1 = performance.now();

	let answer = data.reduce((acc, item) => {
		// Return the sum of the multiplication of the two numbers only if the item is not 'do()' or 'don't()'
		// In the case of 'do()' or 'don't()', return the accumulator as is and move on to the next item
  		return item === 'do()' || item === 'don\'t()' ? acc : acc + item[0] * item[1];
	}, 0);

	log_answer(answer, 1);
}

/**
 * Solves part 2 of the challenge
 * @param {Array} data - The parsed input data
 * @returns {Number} - The answer to the challenge
 */
function solvePart2(data) {
	_TIMERS.part_2 = performance.now();

	// Create the flag can_multi to keep track of whether to multiply the two numbers or not
	let can_multi = true;
	let answer = data.reduce((acc, item) => {
		// if 'do()' or 'don't()' set the flag accordingly, otherwise keep the flag as is
		// If you're not sure about ternary operators, the following comments explain the
		// same logic in an if-else pseudo code:
		// 	if item == 'do()' then can_multi = true
		// 	else if item == 'don't()' then can_multi = false
		// 	else can_multi = can_multi
		can_multi = item === 'do()' ? true : item === 'don\'t()' ? false : can_multi;

		// Return the sum of the multiplication of the two numbers only if the flag is true and the item is not a string
		// In the case of 'do()' or 'don't()', return the accumulator as is and move on to the next item
		return (can_multi && typeof item !== 'string') ? acc + item[0] * item[1] : acc;
	}, 0)

	log_answer(answer, 2);
}


/**
 * Parse the input into a usable format
 * @param {String} input - The input as a string
 * @returns {Array} - The parsed input
 */
function parseInput(input) {
	// Grab all patterns of 'mul(a,b)' or 'do()' or 'don't()' where a and b are integers
	let regex = /mul[(]{1}[0-9]+,[0-9]+[)]{1}|do\(\)|don\'t\(\)/g;
	return input.match(regex)
				.map((line) => {
					// Leave 'do()' and 'don't()' as is and return early to move on to the next line
					if (line === 'do()' || line === 'don\'t()') {
						return line;
					}

					// In any other case assume the line is 'mul(a,b)' and finish parsing the line
					// Extract the two numbers from the 'mul(a,b)' pattern where a and b are integers
					let [a, b] = line.match(/[0-9]+/g);

					// Return the two numbers as an array of integers
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
