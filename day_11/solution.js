// ************ Initalization Stuff ************
import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// Define Generic Global Variables
const _DAY = '11'; // Auto-generated by create.sh script. See README.md for details: https://github.com/frhel/AOC-2024/blob/main/README.md

const _FILE = process.argv[2] || 'in.txt'; // Default input file0 for problem input, 1 for example. Default is 1 for example
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''}; // Object to keep track of individual timers
const _OUTPUT_LENGTH = 60; // The length of the output line
const _ANSWERS = {}; // Object to keep track of answers


printDayTitlePlate(_DAY); // Print a plate with the day of the challenge

// ************ End of Initalization ***********

// ************ Main Logic Stuff ************
let input = readInputFile();
let data = parseInput(input);


let _MEMO = {} // Define a memo object to store already calculated values
_TIMERS.part_1 = performance.now(); // Start the timer for part 1
solvePart1(data);

_TIMERS.part_2 = performance.now(); // Start the timer for part 2
solvePart2(data);

printTotalTime();

// ************ Solution Functions ************
/**
 * Solves part 1 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart1(data) {
	_ANSWERS.part1 = 0;

	let blinks = 25;
	for (let stone of data) {
		_ANSWERS.part1 += blink(stone, blinks);
	}

	logAnswer(_ANSWERS.part1, 1);

}

/**
 * Solves part 2 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart2(data) {
	_ANSWERS.part2 = 0;

	let blinks = 75;
	for (let stone of data) {
		_ANSWERS.part2 += blink(stone, blinks);
	}

	logAnswer(_ANSWERS.part2, 2);
}


/**
 * Recursively calculate the number of stones for a given stone and number of blinks
 * @param {Number} stone - The stone to calculate the number of stones for
 * @param {Number} blinks - The number of blinks to calculate the number of stones for
 * @returns {Number} - The number of stones after the given number of blinks
 */
function blink(stone, blinks) {
	blinks--; // Decrement the number of blinks so we can keep track of how many we have left
	let key = `${stone}-${blinks}` // Create a key for the memo object
	if (_MEMO[key] !== undefined) return _MEMO[key] // If the value is already in the memo object, return it
	let new_num = 0; // Initialize a new number to store the new stone value
	let total = 0; // Initialize a total to store the total number of stones

	// While we have blinks left to do, go through the rules of the puzzle
	// and call the blink function recursively for every new stone value of
	// the current stone we are processing
	if (blinks >= 0) {
		if (stone === 0) {
			total += blink(1, blinks);
		} else if (blinksDigits(stone) % 2 === 0) {
			let str = stone.toString();
			let left = parseInt(str.slice(0, str.length / 2));
			let right = parseInt(str.slice(str.length / 2));
			total += blink(Number(left), blinks)
			total += blink(Number(right), blinks)
		} else {
			total += blink(stone * 2024, blinks);
		}
	} else {
		// If we have no more blinks left, return the current stone value
		total = 1;
	}
	// Remember the total in the memo object and return it
	if (_MEMO[key] === undefined) _MEMO[key] = total;
	return total;
}


/**
 * Parse the input into a usable format
 * Remember to set the @param and @returns values
 */
function parseInput(input) {

	return input.split(' ').map(Number)

}
// ************ End of Solution Functions ************
// ************ End of Main Logic Stuff ************


// ************ Helper Functions ************
/**
 * Count the number of digits in an integer
 * @param {Number} num - The integer to count the digits of
 * @returns {Number} - The number of digits in the integer
 * @example countDigits(123) => 3
 * @example countDigits(0) => 1
 */
function countDigits(num) {
	if (num === 0) return 1;
	let count = 0;
	while (num > 0) {
		count++;
		num = Math.floor(num / 10);
	}
	return count;
}

/**
 * Check if a given coordinate is within the bounds of a grid
 * @param {Array} grid - The grid to check against
 * @param {Number} x - The x coordinate to check
 * @param {Number} y - The y coordinate to check
 * @returns {Boolean} - Whether the coordinate is within the grid
 */
function isWithinBounds(grid, x, y) {
	return x >= 0 && x < grid[0].length && y >= 0 && y < grid.length;
}

/**
 * Print a given grid to the console
 * @param {Array} grid - The grid to print
 */
function printGrid(grid, reverse = false) {
	let out = '';
	if (reverse) grid = grid.reverse();
	grid.forEach(row => {
		out += row.join('') + '\n';
	});
	console.log(out);
}

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

/**
 * Pick the best time unit for a given time
 * @param {Number} time - The time to pick a unit for
 * @returns {Array} - An array with the time and the unit
 */
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
function logAnswer(answer, part) {
	let time = performance.now();
	time = time - _TIMERS[`part_${part}`];
	let time_unit = pickTimeUnit(time);
	let static_length = 31;
	let line_length = static_length + answer.toString().length + time_unit[0].toFixed(4).length;
	let output = chalk(chalk.bold.white('Part ' + part + ' [-'), chalk.yellow.bold(answer), chalk.white.bold('-] in'), chalk.green.bold('[- ' + (time_unit[0]).toFixed(4)), chalk.red(time_unit[1]), chalk.green.bold('-]'));
	console.info(chalk.bold.white('---'), output, chalk.bold.white('-'.repeat(Math.abs(_OUTPUT_LENGTH - line_length))));
}

function logBothAnswers(answers) {
	let time = performance.now();
	time = time - _TIMERS['both'];
	let static_length = 12;
	let time_unit = pickTimeUnit(time);
	answers.forEach((answer, i) => {
		let line_length = static_length + answer.toString().length + time_unit[0].toFixed(4).length;
		let output = chalk(chalk.bold.white('Part ' + (i + 1) + ' [-'), chalk.yellow.bold(answer), chalk.white.bold('-]'));
		console.info(chalk.bold.white('---'), output, chalk.bold.white('-'.repeat(Math.abs(_OUTPUT_LENGTH - line_length))));
	})
	static_length =35
	let line_length = static_length + time_unit[0].toFixed(4).length;
	let output = chalk(chalk.bold.white('Time For Both Parts: [-'), chalk.green.bold(time_unit[0].toFixed(4), chalk.red(time_unit[1]), chalk.white('-]')));
	console.info(chalk.bold.white('---'), output, chalk.bold.white('-'.repeat(Math.abs(_OUTPUT_LENGTH - line_length))));
}


/**
 * Print the day title plate to the console
 * @param {String} day - The day of the challenge
 */
function printDayTitlePlate(day) {
	console.log('\n');
	let title = `-= DAY ${day} =-`;
	let line_length = (_OUTPUT_LENGTH - (title.length) - 2) / 4;
	console.info(chalk.bold.blue('-'.repeat(Math.ceil(line_length)), `${chalk.bold.white(title)}`, '-'.repeat(line_length * 3)));
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
	console.log('\n');
}
// ************ End of Helper Functions ************