import fs from 'fs'; // File system module
import chalk from 'chalk'; // Colorizes console output

// *************************************************
// ************ Define Global Variables ************
const _DAY = 0;
const _TIMERS = {'global': performance.now(), 'part_1': '', 'part_2': ''};
const _STARS = {
	'filled': '★',
	'empty': '☆'
};
_STARS.line_short = _STARS.filled.repeat(20);
_STARS.line_long = _STARS.filled.repeat(56);

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


// ***************************************************
// ************ Define Solution Functions ************

// ************ End of Solution Functions ************

// **********************************************
// ************ Define Solution Vars ************
let _ANSWERS = {
	'part_1': '**-',
	'part_2': '**-'
}

// Add any additional solution variables here

// ************ End of Solution Vars ************


// *****************************************
// ************ Part 1 Solution ************
_TIMERS.part_1 = performance.now();

// Code here

log_answer(_ANSWERS.part_1, 1);
// ************ End of Part 1 ************

// *****************************************
// ************ Part 2 Solution ************
_TIMERS.part_2 = performance.now();

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
	console.info(_STARS.filled.repeat(2), chalk.cyan('Answer: '), chalk.yellow.bold('[-',answer,'-]'), 'in', chalk.green('[-'), chalk.green.bold((performance.now() - _TIMERS[`part_${part}`]).toFixed(4)), chalk.red('ms'), chalk.green('-]'));
	console.info(chalk.blue(_STARS.line_long), '\n');
}
// ************ End of Helper Functions ************























// ------------- Helper Functions -------------
function log_answer(answer, part) {
	console.info(`============ { Day ${day} - Part ${part} } ============`);
	console.info(`Answer: ${answer} in ${(performance.now() - timers[part]).toFixed(4)}ms`);
}
