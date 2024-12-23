// ************ Initalization Stuff ************
import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// Define Generic Global Variables
const _DAY = '14'; // Auto-generated by create.sh script. See README.md for details: https://github.com/frhel/AOC-2024/blob/main/README.md

const _FILE = process.argv[2] || 'in.txt'; // Default input file0 for problem input, 1 for example. Default is 1 for example
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''}; // Object to keep track of individual timers
const _OUTPUT_LENGTH = 50; // The length of the output line
const _ANSWERS = {};

printDayTitlePlate(_DAY); // Print a plate with the day of the challenge

// ************ End of Initalization ***********

// ************ Main Logic Stuff ************
let input = readInputFile();
let data = parseInput(input);


solveBothParts(data);


printTotalTime();

// ************ Solution Functions ************
/**
 * Solves both parts of the challenge
 * @param {Array} bots - The bots to use in the solution
 */
function solveBothParts(bots) {
	_TIMERS.part_1 = performance.now();
	_TIMERS.part_2 = performance.now();

	// Define the upper bounds of the grid
	let bounds_x = 101
	let bounds_y = 103

	// The counter for the number of loops
	let seconds = 0;

	// Upper or lower bound per direction  w, e, n, s
	let quad_defs = [49, 51, 50, 52];

	// Tracker for the number of bots in each quadrant
	// w, e, n, s
	let quads = [0, 0, 0, 0];

	// Build the map of the grid
	let map = buildMap(bounds_x, bounds_y);
	// Update the map cells with which quadrant they are in
	setMapQuadrants(quad_defs, map);

	// Run the loop until we have both answers
	main:
	while(true) {
		// Increment the seconds counter so we know how long we've been running
		seconds++;

		// On each loop, move the bots and update the quadrant tally
		for (let bot of bots) {
			// Next position for the bot based on velocity
			let nx = bot.p.x + bot.v.x;
			let ny = bot.p.y + bot.v.y;

			// Do a bounds check and wrap around if necessary
			bot = wrapAround(nx, ny, bot, bounds_x, bounds_y);

			// Update the quadrant tally
			setQuad(bot, map, quads);
		};
		// If we are on the 100th second, calculate the answer for part 1 and log it
		if (seconds === 100) {
			console.log(quads);
			_ANSWERS.part1 = quads.reduce((acc, val) => acc * val);
			logAnswer(_ANSWERS.part1, 1);
		} else if (seconds > 100) {
			// If we are past the 100th second, check if we have a solution for part 2
			// Check if any of the quadrants have more than half the bots
			for (let count of quads) {
				// If we have more than half the bots in a quadrant, we most likely have a solution
				if (count > 0.5 * bots.length) {
					// Log the answer for part 2 and break the loop
					// Uncomment the following lines to print the grid for part 2
					// let map = buildMap(bounds);
					// map = updateMap(bots, map);
					// printGrid(map);
					_ANSWERS.part2 = seconds;
					logAnswer(_ANSWERS.part2, 2);
					break main;
				}
			}
		}
	}
}


/**
 * Check if a bot is within the bounds of the grid and wrap around if necessary
 * @param {Number} nx - The next x position of the bot
 * @param {Number} ny - The next y position of the bot
 * @param {Object} bot - The bot to check
 * @param {Map} bounds - The bounds of the grid
 * @returns {Object} - The bot with the updated position
 */
function wrapAround(nx, ny, bot, bounds_x, bounds_y) {
	if (nx >= bounds_x) nx = nx - bounds_x;
	else if (nx < 0) nx = bounds_x + nx;
	if (ny >= bounds_y) ny = ny - bounds_y;
	else if (ny < 0) ny = bounds_y + ny;
	bot.p.x = nx;
	bot.p.y = ny;
	return bot;
}

/**
 * Update the quadrant for a bot and update the tally for the relevant quadrants
 * @param {Object} bot - The bot to update
 * @param {Array} quad_defs - The definitions for the quadrants
 * @param {Map} quads - The tally of bots in each quadrant
 */
function setQuad(bot, map, quads) {
	// Determine the quadrant the bot is in
	// let quad = getQuadrant(bot.p.x, bot.p.y, quad_defs);
	// console.log(bot.p);
	// console.log(map[bot.p.y])
	// console.log(bot.p, map[bot.p.y][bot.p.x])
	let quad = map[bot.p.y][bot.p.x];

	// If the bot was in the middle before, don't decrement anything as it was not in a quadrant
	if (bot.quad >= 0) { quads[bot.quad] -= 1; }
	if (quad < 0) { bot.quad = -1; }
	else {
		bot.quad = quad;
		quads[bot.quad] += 1;
	}
}

function setMapQuadrants(quad_defs, map) {
	// Set the quadrant value for each cell in the map
	map.forEach((row, y) => {
		row.forEach((cell, x) => {
			let quad = getQuadrant(x, y, quad_defs);
			map[y][x] = quad;
		});
	});
}

function getQuadrant(x, y, quad_defs) {
	// Quadrant definitions are
	// 0: top left
	// 1: bottom left
	// 2: top right
	// 3: bottom right

	// Set y and x quadrants to -1
	let yquad = -1;
	let xquad = -1;

	// Check if the y coordinate is on the top or bottom
	if (y <= quad_defs[2]) yquad = 0;
	else if (y >= quad_defs[3]) yquad = 1;
	// If the y coordinate is not in the top or bottom, return -1
	if (yquad < 0) return yquad;

	// Check if the x coordinate is on the left or right
	if (x <= quad_defs[0]) xquad = 0;
	else if (x >= quad_defs[1]) xquad = 2;
	// If the x coordinate is not on the left or right, return -1
	if (xquad < 0) return xquad;

	// Return the sum of the x and y quadrants
	return yquad + xquad
}

/**
 * Build a map of the grid with the bots
 * @param {Array} bots - The bots to place on the map
 * @param {Map} bounds - The bounds of the grid
 */
function buildMap(bounds_x, bounds_y) {
	let map = [];
	for (let y = 0; y <= bounds_y; y++) {
		let row = [];
		for (let x = 0; x <= bounds_x; x++) {
			row.push('.');
		}
		map.push(row);
	}
	return map;
}

/**
 * Update the map with the bots
 * @param {Array} bots - The bots to place on the map
 * @param {Array} map - The map to update
 * @returns {Array} - The updated map
 */
function updateMap(bots, map) {
	map = map.map(row => row.map(cell => cell === '#' ? '.' : cell));
	bots.forEach(bot => {
		map[bot.p.y][bot.p.x] = '#';
	});
	return map;
}

/**
 * Parse the input into a usable format
 * Remember to set the @param and @returns values
 */
function parseInput(input) {
	let data = input.split('\n').map(line => {
		let match = line.match(/\-{0,1}\d+,\-{0,1}\d+/g);
		let coords = match.map(coord => coord.split(',').map(Number));
		coords = {p: {x: coords[0][0], y: coords[0][1]}, v: {x: coords[1][0], y: coords[1][1], quad: 'm'}};
		return coords;
	});
	return data;
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
		.toString().trim();
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