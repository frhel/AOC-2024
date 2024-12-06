import { parentPort, workerData } from 'worker_threads';


const _OBSTACLE = '#'; // Symbol for an obstacle
const _START_DIR = 0; // The starting direction
const _DIRS = [[0, -1], [1, 0], [0, 1], [-1, 0]]; // Directions: up, right, down, left

let _GRID = workerData.grid; // The grid
let _GRID_BOUNDS = [_GRID[0].length, _GRID.length]; // The grid bounds
let points = workerData.points; // The points to check
let x = workerData.x; // The x coordinate
let y = workerData.y; // The y coordinate

parentPort.postMessage(executePool(points, x, y));
process.exit();

function executePool(points, x, y) {
	let answer = 0;
	for (let [key, point] of points) {
		let c = point[0];
		let r = point[1];
		// Skip if the cell is an obstacle or the starting point
		if (_GRID[r][c].symbol === _OBSTACLE || _GRID[r][c].symbol === '^') continue;
		_GRID[r][c].symbol = _OBSTACLE; // Set the cell as an obstacle
		// Run the simulation and increment the answer if the simulation returns true
		// Offload the simulation to a worker thread
		answer += runSimulation(x, y, _GRID) ? 1 : 0;
		// Reset the cell to its original state
		_GRID[r][c].symbol = '.';
	};
	return answer;
}

/**
 * Runs the simulation
 * @param {Number} x - The x coordinate
 * @param {Number} y - The y coordinate
 * @param {Number} part - The part of the challenge
 */
function runSimulation(x, y, grid = _GRID) {
	let dir = _START_DIR; // Always start facing up
	let visited = new Set();
	let last_visited_size = visited.size; // Keep track of the last visited size
	let nx, ny; // Next x and y coordinates
	while (true) {
		// Setting the nx and ny values to the next cell while checking if the next cell is inside the bounds
		// seems to be a little faster than setting the values before making the check. Maybe not...
		nx = x + _DIRS[dir][0]; ny = y + _DIRS[dir][1];
		if (!isInsideBounds(nx, ny)) return false;

		// If the next cell is an obstacle, change direction and continue
		if (grid[ny][nx].symbol === _OBSTACLE) {
			dir = (dir + 1) % 4;
			continue;
		}

		// Update the coordinates for the guards current position
		x = nx;	y = ny;
		last_visited_size = visited.size;
		// If not part 1, add the key for the coordinates with direction to the visited set
		visited.add(grid[y][x].keys[dir]);

		// Check if the size of the visited set has changed.
		// This is faster than checking if the key is already in the set
		if (last_visited_size === visited.size) {
			// If there was no change in the visited set size, we have
			// visited this cell with this direction before, so we have
			// found a loop and can return true
			return true;
		}
	}
}

/**
 * Check if the coordinates are inside the bounds of the grid
 * @param {Number} x - The x coordinate
 * @param {Number} y - The y coordinate
 * @returns {Boolean} - True if the coordinates are inside the bounds, false otherwise
 */
function isInsideBounds(x, y) {
	return x >= 0 && x < _GRID_BOUNDS[0] && y >= 0 && y < _GRID_BOUNDS[1];
}