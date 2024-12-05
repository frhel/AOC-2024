// ************ Initalization Stuff ************
import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// Define Generic Global Variables
const _DAY = '05'; // Auto-generated by create.sh script. See README.md for details: https://github.com/frhel/AOC-2024/blob/main/README.md

const _FILE = process.argv[2] || 'in.txt'; // Default input file0 for problem input, 1 for example. Default is 1 for example
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''}; // Object to keep track of individual timers
const _STARS = {'filled': '★', 'empty': '☆'}; // Pretty stars for the console output
_STARS.line_short = _STARS.filled.repeat(20); // Add a line of stars for separation
_STARS.line_long = _STARS.filled.repeat(56); // Add a longer line of stars for bigger separation

printDayTitlePlate(_DAY); // Print a plate with the day of the challenge

// ************ End of Initalization ***********

// ************ Main Logic Stuff ************
let _MEMO = {}; // Create a memo object to store values for quick lookup
let input = readInputFile();
let data = parseInput(input);
solvePart1(data);
solvePart2(data);
printTotalTime();

// ************ Solution Functions ************
/**
 * Solves part 1 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart1([rules, chapters]) {
	_TIMERS.part_1 = performance.now(); // Start the timer for part 1

	let answer = 0;
	// Loop through the chapters and check if they are correct
	for (let chapter of chapters) {
		// Push all the correct chapters to the answer array
		if (isChapterCorrect(rules, chapter)) {
			answer += chapter[(chapter.length - 1) / 2];
		}
	}

	// Log answer for part 1
	log_answer(answer, 1);
}

/**
 * Solves part 2 of the challenge and logs the answer to the console
 * @param {Array} data - The parsed input data
 */
function solvePart2([rules, chapters]) {
	_TIMERS.part_2 = performance.now(); // Start the timer for part 2

	// Consolidate the rules for quicker lookup
	let consolidated = consolidateRules(rules);
	let incorrect = [];
	let answer = 0;


	// Loop through the incorrect chapters and swap pages to make them correct
	chapter:
	for (let chapter of chapters) {
		if (_MEMO[chapter.join('')]) continue;
		for (let p1 = 0; p1 < chapter.length; p1++) {
			// If p1 does not have a rule, skip it
			if (!consolidated[chapter[p1]]) continue;

			// Loop through all the pages before the current page
			// and swap the pages if they are in the wrong order
			for (let p2 = 0; p2 < p1; p2++) {
				// If we can't find p2 in the consolidated rules for p1, skip it
				if (!consolidated[chapter[p1]].includes(chapter[p2])) continue;

				// Perform the swap
				let temp = chapter[p1];
				chapter[p1] = chapter[p2];
				chapter[p2] = temp;
			}
		}
		answer += chapter[(chapter.length - 1) / 2];
	}

	log_answer(answer, 2);
}

/**
 * Consolidate the rules into a single object for quicker lookup
 * @param {Array} rules - The rules to consolidate
 * @returns {Object} - The consolidated rules
 */
function consolidateRules(rules) {
	// Create an object to hold the consolidated rules
	// Object uses the left side of the rule as the key
	// and an array of right side rules as the value
	let consolidated = {};
	for (let rule of rules) {
		// If the rule doesn't exist in the object, create it
		if (!consolidated[rule[0]]) {
			consolidated[rule[0]] = [];
		}
		// Push the right side of the rule onto the object
		consolidated[rule[0]].push(rule[1]);
	}
	return consolidated;
}

/**
 * Returns the chapters that are correct based on the rules
 * @param {Array} rules - The rules to check against
 * @param {Array} chapters - The chapter to check
 * @returns {Boolean} - Whether the chapter is correct or not
 */
function isChapterCorrect(rules, chapter, left = 0, right = 0) {
	// Create a memo object to store values for quick lookup
	let memo = {};
	// Loop through the rules and check if the chapter is compliant
	for (let rule of rules) {
		// Check if we have already checked that the pages in the rule exist
		// Exit early if we have the memoized value as true(doesn't exist)
		if (memo[rule[0]] === true) continue;
		else if ((left = chapter.indexOf(rule[0])) === -1) {
			memo[rule[0]] = true
			continue;
		}
		if (memo[rule[1]] === true) continue;
		else if ((right = chapter.indexOf(rule[1])) === -1) {
			memo[rule[1]] = true
			continue;
		}

		// If the left page is lower in the chapter than the right page, the rule is broken
		if (left >= right) { return false; }
	}

	_MEMO[chapter.join('')] = true;
	return true // If we haven't returned false yet, the chapter is correct
}


/**
 * Parse the input into a usable format
 * Remember to set the @param and @returns values
 */
function parseInput(input) {

	input = input.split('\n')
	let [rules, chapters] = [
		input.slice(0, input.indexOf(''))
			 .map(rule => rule.split('|').map(Number)),
		input.slice(input.indexOf('') + 1, input.length)
			 .map(chapter => chapter.split(',').map(Number))
	];
	return [rules, chapters];

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

/**
 * Log the answer to the console
 * @param {Number} answer - The answer to log
 * @param {Number} part - The part of the _DAY
 */
function log_answer(answer, part) {
	console.info(chalk.blue(_STARS.line_short), ' '.repeat(3), chalk.bold.white('Part ' + part), ' '.repeat(3), chalk.blue(_STARS.line_short));
	console.info(_STARS.filled.repeat(2), chalk.cyan('Answer: '), '[-', chalk.yellow.bold(answer), '-] in', chalk.green('[-'), chalk.green.bold((performance.now() - _TIMERS[`part_${part}`]).toFixed(4)), chalk.red('ms'), chalk.green('-]'));
}

/**
 * Print the day title plate to the console
 * @param {String} day - The day of the challenge
 */
function printDayTitlePlate(day) {
	console.info(chalk.blue(`\n${_STARS.line_short} ${chalk.bold.white('DAY .-[',_DAY,']-.')} ${_STARS.line_short}`));
}

/**
 * Print the total time to the console
 */
function printTotalTime() {
	console.info(chalk.blue(_STARS.line_short), ' '.repeat(1), chalk.bold.white('Total Time'), ' '.repeat(1), chalk.blue(_STARS.line_short));
	console.info(chalk.blue(_STARS.filled.repeat(23)), chalk.green.bold((performance.now() - _TIMERS['global']).toFixed(4))+chalk.bold.white('ms'), chalk.blue(_STARS.filled.repeat(23)));
}
// ************ End of Helper Functions ************
