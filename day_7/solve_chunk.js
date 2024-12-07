import { parentPort, workerData } from 'worker_threads';

let _data = workerData.data
let _OPERATORS = workerData.operators;
let _PART = workerData.part;
let _REJECTS = [];


parentPort.postMessage(executeChunk(_data));
process.exit();

function executeChunk(data) {
	let answer = 0;
	for (let eq of data) {
		// Recurse through the data and find if the test is possible or not
		let res = recurseSolution(eq[0], eq[1][0], eq[1][1], eq[1].slice(2), _PART);
		answer += res;
		// Any tests that return 0 are added to the rejects array
		if (_PART === 1 && res === 0) _REJECTS.push(eq);
	}
	// Return JSON object with the answer and rejects
	return { answer, rejects: _REJECTS };
}


function recurseSolution(test, left, right, line, part) {

	let new_line = line.slice(1);
	// Create a new branch for each operation
	for (let operator of _OPERATORS) {
		let res = handleRecursion(test, left, right, line, new_line, part, operator);
		if (res === -1) continue;
		else if (res === test) return res;
	}
	return 0;
}

function handleRecursion(test, left, right, line, new_line, part, operator) {
	let outcome = performOperation(operator, left, right);
	// If the outcome is greater than the test, skip this branch as it will not be possible
	// to reduce the accumulated number to match the test
	if (outcome > test) return -1;
	if (outcome === test) return outcome;

	// If there are more numbers in the line, recurse through the rest of the line with the outcome added to the front
	if (line.length > 0) {
		let res = recurseSolution(test, outcome, line[0], new_line, part);
		if (res === test) return res;
	}
	return 0;
}

function performOperation(operator, left, right) {
	let outcome = 0;
	if (operator === '+') outcome = left + right;
	else if (operator === '*') outcome = left * right;
	else if (operator === '||') outcome = Number(`${left}${right}`);
	return outcome;
}
