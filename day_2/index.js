import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// *************************************************
// ************ Define Global Variables ************
const _DAY = '02';
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''};
const _STARS = {
	'filled': '★',
	'empty': '☆'
};
_STARS.line_short = _STARS.filled.repeat(20);
_STARS.line_long = _STARS.filled.repeat(56);

const _TOLERANCES = {
	low: 1,
	high: 3
};
const _ANSWERS = {
	'part_1': '**-',
	'part_2': '**-'
}

console.info(chalk.blue(`\n${_STARS.line_long}`));
console.info(chalk.blue(`${_STARS.line_short} ${chalk.bold.white('DAY .-[',_DAY,']-.')} ${_STARS.line_short}`));
console.info(chalk.blue(`${_STARS.line_long}\n`));
// ************- End of Global Variables -************

// *****************************************
// ************ Read Input File ************
let _FILES = {
	'problem': 'in.txt',
	'example': 'ex.txt'
};
let _EXAMPLE = 0;

let input = fs
	.readFileSync(_EXAMPLE === 0 ? _FILES.problem : _FILES.example)
	.toString()
// ************ End of Read Input ************

// *********************************************
// ************ Parse / Shape Input ************

let _REPORTS = input.split('\n')
					.map(x => x.split(' ')
					.map(Number));
// ************ End of Input Parsing ************


// *************************************************
// ************ Define Common Functions ************
/**
 * Get the direction of the current value compared to the previous value
 * @param {Number} cur - The current value
 * @param {Number} prev - The previous value
 * @returns {Number} - 1 if the current value is greater than the previous, -1 otherwise
 */
function get_dir(cur, prev) {
	return cur > prev ? 1 : -1;
}

/**
 * Check if the report is safe
 * @param {Array} report - The report to check
 * @returns {Boolean} - True if the report is safe, false otherwise
 */
function check_report(report) {
	let prev = report[0];

	// Initialize as true, if any of the conditions are met, set to false and immediately return
	let safe = true;

	// Save the initial direction to compare with the rest. Fail if the direction changes
	let dir = get_dir(report[1], prev);
	for (let i = 1; i < report.length; i++) {

		// Get an absolute difference between the current and prev value for easy comparison to the tolerances
		let diff = Math.abs(report[i] - prev);

		// Check if the difference is within the tolerances, if the current value is the same as the prev, or if the direction has changed
		// If any of these conditions are met, the report is not safe and the loop is broken
		if (diff < _TOLERANCES.low
			|| diff > _TOLERANCES.high
			|| report[i] === prev
			|| get_dir(report[i], prev) !== dir)
		{
			return !safe;
		}

		// Remember to update the prev value for the next iteration
		prev = report[i];
	}

	// If the loop completes without breaking, the current report is safe and the initial value of true is returned
	// otherwise, false is returned as it was set in the loop
	return safe;
}

function check_permutations(report) {
	// Assume the report is safe until proven otherwise
	let safe = true;

	// Check if the report is safe as is
	if (check_report(report)) {
		return safe;
	}

	// Test each permutation of the report by removing one value at a time
	// As soon as a safe report is found, return true and stop checking
	for (let i = 0; i < report.length; i++) {
		let copy = report.slice();
		copy = copy.slice(0, i).concat(copy.slice(i + 1));
		if (check_report(copy)) {
			return safe;
		}
	}

	// If no safe report is found, the report is not safe
	return !safe
}
// ************ End of Common Functions ************


// *****************************************
// ************ Part 1 Solution ************
_TIMERS.part_1 = performance.now();

// Run each report through the check_report function to determine if it is safe
// Extract the number of safe _REPORTS by filtering out the false values and counting the remaining true values
let p1_reports = _REPORTS.slice();
_ANSWERS.part_1 = p1_reports.map((cur) => check_report(cur))
						  .filter(x => x).length;

log_answer(_ANSWERS.part_1, 1);
// ************ End of Part 1 ************


// *****************************************
// ************ Part 2 Solution ************
_TIMERS.part_2 = performance.now();

// Run each report through the check_permutations function to determine if it is safe
// Extract the number of safe _REPORTS by filtering out the false values and counting the remaining true values
let p2_reports = _REPORTS.slice();
_ANSWERS.part_2 = p2_reports.map((cur) => check_permutations(cur))
						    .filter(x => x).length;

log_answer(_ANSWERS.part_2, 2);
// ************ End of Part 2 ************

// ***************************************
// ************ Timing Wrapup ************
console.info(chalk.blue(_STARS.line_short), ' '.repeat(1), chalk.bold.white('Total Time'), ' '.repeat(1), chalk.blue(_STARS.line_short));
console.info(chalk.blue(_STARS.filled.repeat(23)), chalk.green.bold((performance.now() - _TIMERS['global']).toFixed(4))+chalk.bold.white('ms'), chalk.blue(_STARS.filled.repeat(23)));
console.info(chalk.blue(_STARS.line_long));
// ************ End of Wrapup ************


// ******************************************
// ************ Helper Functions ************
/**
 * Log the answer to the console
 * @param {Number} answer - The answer to log
 * @param {Number} part - The part of the _DAY
 * @returns {undefined}
 */
function log_answer(answer, part) {
	console.info(chalk.blue(_STARS.line_short), ' '.repeat(3), chalk.bold.white('Part ' + part), ' '.repeat(3), chalk.blue(_STARS.line_short));
	console.info(_STARS.filled.repeat(2), chalk.cyan('Answer: '), chalk.yellow.bold('[-',answer,'-]'));
	console.info(_STARS.filled.repeat(2), chalk.cyan('  Time: '), chalk.green('[-'), chalk.green.bold((performance.now() - _TIMERS[`part_${part}`]).toFixed(4)), chalk.bold.white('ms'), chalk.green('-]'));
	console.info(chalk.blue(_STARS.line_long), '\n');
}
// ************ End of Helper Functions ************
