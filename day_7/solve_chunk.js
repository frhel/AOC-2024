import { parentPort, workerData } from 'worker_threads';

let _data_chunk = workerData.data // The chunk of data to process
let _OPERATORS = workerData.operators; // The operators to use
let _PART = workerData.part; // The part of the puzzle we are solving
let _REJECTS = []; // The rejects array

// Send the result from executeChunk() back to the parent thread
parentPort.postMessage(executeChunk(_data_chunk));
process.exit();

/**
 * Executes solution code on a chunk of data
 * @param {Array} data - The data to process
 * @returns {Object} - The answer and rejects
 */
function executeChunk(data) {
	let answer = 0;

	// For every equation in the data
	for (let eq of data) {
		// Recurse through the data and find if the test is possible or not
		let res = startNewRecursionBranches(eq[0], eq[1][0], eq[1][1], eq[1].slice(2), _PART);
		answer += res;
		// Any tests that return 0 are added to the rejects array but only for part 1
		// Part 2 will use the rejects array to solve the second part of the puzzle
		if (_PART === 1 && res === 0) _REJECTS.push(eq);
	}
	// Return JSON object with the answer and rejects to the main thread
	return { answer, rejects: _REJECTS };
}

/**
 * Recursively solve the equation with different operators to see which one will match the test
 * @param {Number} test - The test value to match
 * @param {Number} left - The left side of the current pair of numbers
 * @param {Number} right - The right side of the current pair of numbers
 * @param {Array} line - The rest of the numbers to process
 * @param {Number} part - The part of the puzzle we are solving
 * @returns {Number} - The result of the recursion
 */
function startNewRecursionBranches(test, left, right, line, part) {
	// Make sure we copy the line so we don't modify the original
	// for every branch of the recursion
	let new_line = line.slice(1);

	// Create a new branch for each operation
	for (let operator of _OPERATORS) {
		// Send the operation to the recursion handler
		let res = handleRecursion(test, left, right, line, new_line, part, operator);
		// If the result is the test, return it
		if (res === test) return res;
	}
	return 0;
}

/**
 * Handle the recursion for each branch of the equation
 * @param {Number} test - The test value to match
 * @param {Number} left - The left side of the current pair of numbers
 * @param {Number} right - The right side of the current pair of numbers
 * @param {Array} line - The rest of the numbers to process
 * @param {Array} new_line - A copy of the rest of the numbers to process
 * @param {Number} part - The part of the puzzle we are solving
 * @param {String} operator - The operator to use
 * @returns {Number} - The result of the recursion
 */
function handleRecursion(test, left, right, line, new_line, part, operator) {
	// Perform the operation on the left and right numbers
	let outcome = performOperation(operator, left, right);

	// If the outcome is greater than the test, kill the branch
	// as it is impossible to reach the test value
	if (outcome > test) return -1;
	// If the outcome is the test, return it as we have found a solution
	if (outcome === test) return outcome;

	// If there are more numbers left to process
	// recurse through the rest of them with the new outcome as the left side
	if (line.length > 0) {
		// Send the new outcome to the recursion initializer
		let res = startNewRecursionBranches(test, outcome, line[0], new_line, part);
		// If the result is the test, return it as we have found a solution
		if (res === test) return res;
	}
	return 0;
}

/**
 * Depending on the operator, perform the operation on the left and right numbers
 * @param {String} operator - The operator to use
 * @param {Number} left - The left side of the current pair of numbers
 * @param {Number} right - The right side of the current pair of numbers
 * @returns {Number} - The outcome of the operation
 */
function performOperation(operator, left, right) {
	let outcome = 0;
	if (operator === '+') outcome = left + right;
	else if (operator === '*') outcome = left * right;
	else if (operator === '||') outcome = Number(`${left}${right}`);
	return outcome;
}
