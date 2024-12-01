const day = 1;
const timers = {'global': performance.now(), '1': '', '2': ''};

// ------------- Read File -------------
 let file_in = 'in.txt';
//let file_in = 'ex.txt';

let fs = require('fs');
let input = fs
	.readFileSync(file_in)
	.toString()
	.split('\n');

// ------------- Parse / Shape Input -------------
let lines = input
	.map(line => line.split(' ')
	.filter(x => x !== ''));

let left = lines.map(line => line[0]).sort((a, b) => a - b);
let right = lines.map(line => line[1]).sort((a, b) => a - b);


// ------------- Define Answer Variables -------------
part_1 = 0;
part_2 = 0;


// ------------- Part 1 Solution -------------
timers['1'] = performance.now();
for (let i = 0; i < left.length; i++) {
	part_1 += Math.abs(left[i] - right[i]);
}
log_answer(part_1, 1);

// ------------- Part 2 Solution -------------
timers['2'] = performance.now();
for (let i = 0; i < left.length; i++) {
	let count = 0;
	for (let j = 0; j < left.length; j++) {
		if (left[i] === right[j]) {
			part_2 += Number(left[i]);
		}
	}
	count = 0;
}
log_answer(part_2, 2);

// ------------- End of Script -------------
console.info(`Total time: ${performance.now() - timers['global']}ms`);























// ------------- Helper Functions -------------
function log_answer(answer, part) {
	console.info(`============ { Day ${day} - Part ${part} } ============`);
	console.info(`Answer: ${answer} in ${(performance.now() - timers[part]).toFixed(4)}ms`);
}
