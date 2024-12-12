// ************ Initalization Stuff ************
import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// Define Generic Global Variables
const _DAY = '12'; // Auto-generated by create.sh script. See README.md for details: https://github.com/frhel/AOC-2024/blob/main/README.md

const _FILE = process.argv[2] || 'in.txt'; // Default input file0 for problem input, 1 for example. Default is 1 for example
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''}; // Object to keep track of individual timers
const _OUTPUT_LENGTH = 50; // The length of the output line
const _ANSWERS = {};

printDayTitlePlate(_DAY); // Print a plate with the day of the challenge

// ************ End of Initalization ***********

// ************ Main Logic Stuff ************
let input = readInputFile();
let data = parseInput(input);

let _DIRS = [[0, 1, 'd'], [1, 0, 'r'], [0, -1, 'u'], [-1, 0, 'l']]; // Directions: Right, Down, Left, Up

let _REGIONS = new Map();

_TIMERS.part_1 = performance.now(); // Start the timer for part 1
_ANSWERS.part1 = solvePart1(data);
logAnswer(_ANSWERS.part1, 1);

_TIMERS.part_2 = performance.now(); // Start the timer for part 2
_ANSWERS.part2 = solvePart2(data);
logAnswer(_ANSWERS.part2, 2);

printTotalTime();

// ************ Solution Functions ************
/**
 * Solves part 1 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart1(data) {

	let regions = new Map();
	let perimeter = [];
	let seen = new Set();
	let type = '';
	for (let row = 0; row < data.length; row++) {
		for (let col = 0; col < data[row].length; col++) {
			type = data[row][col];
			let region = 0;
			perimeter = [];
			let queue = [[col, row]];
			while (queue.length) {
				let curr = queue.pop();
				// if the cell is already in the set, skip it
				if (seen.has(curr[0]+curr[1]*10000)) continue;
				// add the cell to the set
				seen.add(curr[0]+curr[1]*10000);
				// add the cell to the region
				region++;

				// walk in all directions
				for (let dir of _DIRS) {
					let nx = curr[0] + dir[0];
					let ny = curr[1] + dir[1];
					// if the cell is out of bounds, skip it
					if (!isWithinBounds(data, nx, ny) || data[ny][nx] !== type) {
						perimeter.push([curr[0], curr[1], dir[2]]);
						continue;
					}
					queue.push([nx, ny]);
				}
			}
			if (region > 0 && perimeter.length > 0) {
				if (!regions.has(type)) {
					regions.set(type, []);
				}
				regions.get(type).push({region, perimeter});

			}
		}
	}


	let price = 0;
	for (let [type, region] of regions) {
		for (let subregion of region) {
			// console.log(type, region.length, perimeter.length);
			// console.log(perimeters.get(type));
			price += subregion.region * subregion.perimeter.length;
		}
	}

	_REGIONS = regions

	return price
}

/**
 * Solves part 2 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart2(data) {

	let regions = _REGIONS;

	let price = 0;

	for (let list of regions) {
		for (let region of list[1]) {
			let current = region.perimeter;
			let sides = [];
			let count = 0;
			for (let dir of _DIRS) {
				sides.push(current.filter((side) => side[2] === dir[2]));
			}

			for (let side of sides) {
				let units = side;
				if (units[0][2] === 'd' || units[0][2] === 'u') {
					units.sort((a, b) => a[0] - b[0]);
					units.sort((a, b) => a[1] - b[1]);
				} else {
					units.sort((a, b) => a[1] - b[1]);
					units.sort((a, b) => a[0] - b[0]);
				}

				let next = units[0];
				count++;

				for (let i = 0; i < units.length; i++) {
					if (units[i][2] === 'd' || units[i][2] === 'u') {
						if (units[i][0] !== next[0] || units[i][1] !== next[1]) {
							count++;
						}
						next = [units[i][0] + 1, units[i][1]];
					} else {
						if (units[i][0] !== next[0] || units[i][1] !== next[1]) {
							count++;
						}
						next = [units[i][0], units[i][1] + 1];
					}
				}
			}
			price += region.region * count;
		}
	}

	return price
}


/**
 * Parse the input into a usable format
 * Remember to set the @param and @returns values
 */
function parseInput(input) {

	let grid = input.trim().split('\n').map(row => row.split(''));
	return grid

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