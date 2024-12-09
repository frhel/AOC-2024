// ************ Initalization Stuff ************
import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// Define Generic Global Variables
const _DAY = '09'; // Auto-generated by create.sh script. See README.md for details: https://github.com/frhel/AOC-2024/blob/main/README.md

const _FILE = process.argv[2] || 'in.txt'; // Default input file0 for problem input, 1 for example. Default is 1 for example
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''}; // Object to keep track of individual timers
const _OUTPUT_LENGTH = 54; // The length of the output line

printDayTitlePlate(_DAY); // Print a plate with the day of the challenge

// ************ End of Initalization ***********

// ************ Main Logic Stuff ************
let input = readInputFile();
let data = parseInput(input);
let files = expandData(data);
let [empty, full] = shapeData(files);
solvePart1(files);
solvePart2(files, empty, full);
printTotalTime();

// ************ Solution Functions ************
/**
 * Solves part 1 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart1(data) {
	_TIMERS.part_1 = performance.now(); // Start the timer for part 1

	let answer = 0;
	let files = data.slice();

	let eof = files.length - 1; // End of file pointer

	// For every empty space we encounter, we move one part of a file from the back
	// to its position.
	left:
	for (let i = 0; i < files.length; i++) {
		// If we encounter a file, we skip it
		if (files[i] !== '.') continue left;

		// When we encounter an empty space, we start moving files from the back.
		// We use the eof variable to keep track of where the right pointer should start
		// checking for files.
		right:
		for (let j = eof; j > i; j--) {
			// Update the eof pointer to the current position of the right pointer
			eof = j;

			// If left and right pointers cross, we break out of the loop
			// as we can't move any more files
			if (files[j] <= files[i]) continue left;


			// If we find a file fragment, we swap it with the empty space
			if (files[j] !== '.') {
				files[i] = files[j]
				files[j] = '.';
			}
		}
	}

	// Calculate the answer
	for (let i = 0; i < files.length; i++) {
		if (files[i] === '.') continue;
		answer += files[i] * i;
	}

	log_answer(answer, 1);
}

/**
 * Solves part 2 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart2(data, empty_mem_blocks, full_mem_blocks) {
	_TIMERS.part_2 = performance.now(); // Start the timer for part 2

	// Code to solve part 2 goes here
	let answer = 0;
	let memory = data.slice();

	// Start moving whole files from the back to empty memory blocks in the front wherever they fit
	compact:
	while(full_mem_blocks.length > 0) {
		// While there are memory left to move, we pop the last file off the array
		let f = full_mem_blocks.pop();

		// If the file position in memory is less than the last empty space, we break out of the loop
		if (f[1][0] < empty_mem_blocks.at(-1)[0]) break compact;

		let stack = []; // Stack to keep track of the empty spaces we've checked

		// Check every empty memory block for a fit for the current file. If we find a fit, we slot the file in
		// and continue with the next file. We keep checking until we find a fit or reach the current file position
		// in memory
		e:
		while (empty_mem_blocks.length > 0) {
			// We pop an empty memory block off the array of empty memory blocks
			// and push it onto the stack. We also save the popped block in a variable
			// for easier access
			stack.push(empty_mem_blocks.pop());
			let e = stack.at(-1);

			// If the start of the memory block overlaps with the file, we break out of the loop
			if (e.at(-1) > f[1][0]) break e;

			// If the file fits in the empty block, we slot it in and continue with the next file
			if (f[1].length <= e.length) {
				// For every fragment of the file, we slot it into the empty memory block
				for (let i = 0; i < f[1].length; i++) {
					// We pop the first available pointer off the current memory block array
					// and use it to slot the file fragment into its new position
					memory[e.pop()] = f[0]; // Slot the file fragment in its new position
					memory[f[1][i]] = '.';  // Reset the old position of the file fragment to an empty space
				}
				// If the memory block is full, we pop it off the stack and throw it away
				if (e.length === 0) stack.pop();
				break e;
			}
		}
		// Push all empty memory that we've checked back onto the empty memory blocks array
		while (stack.length > 0) {
			empty_mem_blocks.push(stack.pop());
		}
	}

	// Calculate the answer
	for (let i = 0; i < memory.length; i++) {
		if (memory[i] === '.') continue;
		answer += memory[i] * i;
	}

	log_answer(answer, 2);
}

function shapeData(data) {
	let memory = data.slice();

	// We split the memory into two arrays, one for empty memory blocks and one for full file blocks
	let empty_mem_blocks = [];
	let full_mem_blocks = [];
	let ei = -1; // Empty index
	let fi = -1; // Full index

	// We iterate through the memory array and create a new array for each
	// contiguous empty space we encounter. Each array contains pointers
	// to the empty spaces in memory
	// NOTE: We start from the back of the array to make it easier to pop and push
	// memory blocks to and from the empty memory blocks array
	for (let i = memory.length - 1; i >= 0; i--) {
		if (memory[i] === '.') {
			// If we encounter an empty space, we create a new block in the empty memory blocks array
			empty_mem_blocks.push([]);
			ei++;
			// While the empty space is contiguous, we add the current index as a pointer to the empty memory block
			while (memory[i] === '.') {
				empty_mem_blocks[ei].push(i);
				i--;
			}
		}
	}

	let file_id = -1; // Keep track of the current file id

	// We iterate through the memory array again and this time we create
	// a block in the full memory blocks array for each whole file we encounter.
	// Each block is an array that contains the file id and an array of file fragment pointers.
	// NOTE: We start from the front of the array so we can just pop the last file off the array,
	// process it and discard it when we're done (as the rules state that we are only allowed to
	// process each file once)
	for (let i = 0; i < memory.length - 1; i++) {
		if (memory[i] === '.') continue; // Skip empty spaces
		if (memory[i] !== file_id) {
			// If we encounter a new file, we create a new block in the full memory blocks array
			// set the file id and create an array for the fragment pointers
			file_id = memory[i];
			full_mem_blocks.push([file_id, []]);
			fi++; // Increment the current full memory block pointer

			// While the file is contiguous, we add the pointer to the fragment array of the current block
			while (memory[i] === file_id) {
				full_mem_blocks[fi][1].push(i);
				i++;
			}
		}
		// We decrement i here because we don't want the for loop to increment it again
		// on the next iteration as we already incremented it in the while loop above
		i--;
	}
	return [empty_mem_blocks, full_mem_blocks];
}

function expandData(data) {

	let files = [];
	let file_id = 0;
	for (let i = 0; i < data.length; i++) {
		if (i % 2 === 0) {
			for (let j = 0; j < data[i]; j++) {
				files.push(file_id);
			}
			file_id++;
		} else {
			for (let j = 0; j < data[i]; j++) {
				files.push('.');
			}
		}
	}
	return files;
}


/**
 * Parse the input into a usable format
 * Remember to set the @param and @returns values
 */
function parseInput(input) {

	let data = input.split('').map(digits => Number(digits));
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