// ************ Initalization Stuff ************
import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// Define Generic Global Variables
const _DAY = '10'; // Auto-generated by create.sh script. See README.md for details: https://github.com/frhel/AOC-2024/blob/main/README.md

const _FILE = process.argv[2] || 'in.txt'; // Default input file0 for problem input, 1 for example. Default is 1 for example
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''}; // Object to keep track of individual timers
const _OUTPUT_LENGTH = 50; // The length of the output line

printDayTitlePlate(_DAY); // Print a plate with the day of the challenge

// ************ End of Initalization ***********

// ************ Main Logic Stuff ************
let input = readInputFile();
let data = parseInput(input);

let _DIRS = [[0, 1], [1, 0], [0, -1], [-1, 0]]; // Right, Down, Left, Up
let _TRAILHEAD = 0;
let _TRAILHEADS = findTrailheads(data);
let _TARGET = 9;

solvePart1(data);
solvePart2(data);

printTotalTime();

// ************ Solution Functions ************
/**
 * Solves part 1 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart1(data) {
	_TIMERS.part_1 = performance.now(); // Start the timer for part 1

	// Define vars
	let answer = 0, current, stack, x, y, trailhead, dir;
	let found = new Set();

	// Loop through all trailheads and find all paths leading to the target
	trailheads:
	for (trailhead of _TRAILHEADS) {

		// Use a basic dfs to find all paths from the trailhead
		found = new Set();
		stack = [trailhead];
		while(stack.length > 0) {
			current = stack.pop();
			// If the current value is the target, add it to the found set
			// Using a set as an easy way to avoid duplicates
			// To read more about the Set object: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set
			if (current.val === _TARGET) {
				found.add(current.x+current.y*1000);
				continue;
			}

			// Otherwise, keep looking for the target
			for (dir of _DIRS) {
				// x and y are the next coordinates to check
				x = current.x + dir[0];
				y = current.y + dir[1];
				if (isWithinBounds(data, x, y) && data[y][x] === current.val + 1) {
					// Push the next coordinates to the stack
					stack.push({x, y, val: data[y][x]});
				}
			}
		}
		// Because the set only contains unique values, we can just add the size of the set to the answer
		answer += found.size;
	}



	log_answer(answer, 1);
}

/**
 * Solves part 2 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart2(data) {
	_TIMERS.part_2 = performance.now(); // Start the timer for part 2

	// Define vars
	let answer = 0, current, stack, x, y, trailhead, dir, count;

	// Loop through each trailhead
	for (trailhead of _TRAILHEADS) {
		// Reset the count for each trailhead
		count = 0;

		// Use a basic dfs to find all paths from the trailhead
		stack = [trailhead];
		while(stack.length > 0) {
			current = stack.pop();

			// If the current value is the target, increment the count for the trailhead and kill this branch
			if (current.val === _TARGET) {
				count++;
				continue;
			}

			// Otherwise, keep looking for the target
			for (dir of _DIRS) {
				// x and y are the next coordinates to check
				x = current.x + dir[0];
				y = current.y + dir[1];

				// If the next value is the next in the sequence, add it to the stack
				if (isWithinBounds(data, x, y) && data[y][x] === current.val + 1) {
					stack.push({x, y, val: data[y][x]});
				}
			}
		}
		// Add the count for this trailhead to the answer
		answer += count;
	}


	log_answer(answer, 2);
}

/**
 * Find all trailheads in the data and create an array of objects with the x, y, and value of the trailhead
 * @param {Array} data - The parsed input data
 * @returns {Array} - An array of objects with the x, y, and value of the trailhead
 */
function findTrailheads(data) {
	let trailheads = [];
	for (let y = 0; y < data.length; y++) {
		for (let x = 0; x < data[y].length; x++) {
			if (data[y][x] === _TRAILHEAD) {
				trailheads.push({x, y, val: data[y][x]});
			}
		}
	}
	return trailheads;
}


/**
 * Parse the input into a usable format
 * Remember to set the @param and @returns values
 */
function parseInput(input) {

	return input.trim().split('\n').map(line => line.split('').map(Number));

}
// ************ End of Solution Functions ************
// ************ End of Main Logic Stuff ************


// ************ Helper Functions ************
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