// ************ Initalization Stuff ************
import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// Define Generic Global Variables
const _DAY = '08'; // Auto-generated by create.sh script. See README.md for details: https://github.com/frhel/AOC-2024/blob/main/README.md

const _FILE = process.argv[2] || 'in.txt'; // Default input file0 for problem input, 1 for example. Default is 1 for example
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''}; // Object to keep track of individual timers
const _OUTPUT_LENGTH = 50; // The length of the output line

printDayTitlePlate(_DAY); // Print a plate with the day of the challenge

// ************ End of Initalization ***********

// ************ Main Logic Stuff ************
let input = readInputFile();
let data = parseInput(input);

// Generate the antinode vectors for each antenna type
let antennas = generatePaths(data.grid, data.antennas);

solvePart1(data.grid, antennas);
solvePart2(data.grid, antennas);
printTotalTime();

// ************ Solution Functions ************
/**
 * Solves part 1 of the challenge and logs the answer to the console
 * @param {Array} grid - The grid to place the antinodes on
 * @param {Array} antennas - Antennas with vectors to find the antinodes
 */
function solvePart1(grid, antennas) {
	_TIMERS.part_1 = performance.now(); // Start the timer for part 1

	// Deep copy the grid to avoid modifying the original
	let map = grid.map(row => row.slice());
	let nx, ny;
	let answer = 0;

	// Iterate over all the antennas to process to find the antinodes
	// Antennas are saved in a sub-array per type so we have to iterate over all types
	for (let antenna of antennas) {
		// Each antenna is a tuple containing the current antenna and the vector to the nearest antinode
		// nx and ny are where the next antinode would be placed
		nx = antenna[0][0] + antenna[1][0];
		ny = antenna[0][1] + antenna[1][1];

		// If the next node is inside the map we can place the antinode and increment the answer
		if (isWithinBounds(map, nx, ny)) {
			if (map[ny][nx] === '#') continue;
			answer++;
			map[ny][nx] = '#';
		}
	}
	log_answer(answer, 1);
}


/**
 * Solves part 2 of the challenge and logs the answer to the console
 * @param {Array} map - The grid to place the antinodes on
 * @param {Array} antennas - Antennas with vectors to find the antinodes
 */
function solvePart2(map, antennas) {
	_TIMERS.part_2 = performance.now(); // Start the timer for part 2

	// Pretty much same as part 1 but we don't have to worry about mutating the map
	// as there is no further processing to be done
	let nx, ny, antenna, answer = 0;

	// Iterate over all the antennas to process to find the antinodes
	// Antennas are saved per type so we have to iterate over all types
	while (antennas.length > 0) {
		// Pop the last antenna off the stack
		antenna = antennas.pop();
		// Each antenna is a tuple containing the current antenna and the vector to the nearest antinode
		// nx and ny are where the next antinode would be placed.
		nx = antenna[0][0] + antenna[1][0];
		ny = antenna[0][1] + antenna[1][1];

		// Since we are counting the valid starting antennas as antinodes
		// we can place and antinode here and increment the answer
		if (map[antenna[0][1]][antenna[0][0]] !== '#') {
			map[antenna[0][1]][antenna[0][0]] = '#';
			answer++;
		}

		// Because we are now placing antinodes on ALL valid antennas
		// in a line instead of just the first one we have to iterate over
		// the line and place antinodes on all valid antennas
		while (isWithinBounds(map, nx, ny)) {
			// If the antenna is valid, check if it is already an antinode
			// and if not place an antinode and increment the answer
			if (map[ny][nx] !== '#') {
				answer++;
				map[ny][nx] = '#';
			}
			// Move to the next antenna in the line, using the vector
			// to determine the direction
			nx += antenna[1][0];
			ny += antenna[1][1];
		}
	}

	log_answer(answer, 2);
}


function generatePaths(grid, antennas) {
	let return_array = [];
	let p, x, y, type_count = 0;

	// Iterate over all the unique types of antinodes
	for (let [key, p] of antennas) {
		// Iterate over all antennas of the same type
		// and generate a vector to all other antennas of the same type
		for (let i = 0; i < p.length; i++) {
			for (let j = 0; j < p.length; j++) {
				// Skip the current antenna. We don't want to generate a vector to itself
				if (i === j) continue;
				// Generate the vector
				x = p[i][0] - p[j][0];
				y = p[i][1] - p[j][1];
				// Push the vector to the return array
				return_array.push([[p[i][0], p[i][1]], [x, y]]);
			}
		}
	}
	return return_array;
}

/**
 * Parse the input into a usable format
 * Remember to set the @param and @returns values
 */
function parseInput(input) {

	let grid = input.split('\n').map(line => line.split(''));

	let antennas = new Map();
	// Iterate over the grid and find all the antennas
	// Save the antennas in a map with the type as the key
	grid.forEach((row, y) => {
		row.forEach((cell, x) => {
			// If the cell is not a dot, it must be an antenna
			if (cell !== '.') {
				antennas.set(cell, [...antennas.get(cell) || [], [x, y]]);
			}
		});
	});
	return {grid, antennas};
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