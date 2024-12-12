fn main() {
    println!("\n------------- Day 1 -------------");
    // Start a timer
    let total_start = std::time::Instant::now();
    // Read the ex.txt file from ../../day_1/ex.txt
    let contents = std::fs::read_to_string("../../day_1/in.txt")
        .expect("Something went wrong reading the file");

    // Split the contents by new line as well as by double space
    let lines: Vec<&str> = contents.split("\n").collect();

    let mut hashmap = std::collections::HashMap::new();
    // Split each line and convert to integer
    let pairs: Vec<(i32, i32)> = lines.iter()
        .map(|line| {
            let pair: Vec<i32> = line.split("   ")
                .map(|x| x.parse::<i32>().unwrap())
                .collect();
            // Insert the right value into the hashmap with count plus 1
            let count = hashmap.entry(pair[1]).or_insert(0);
            *count += 1;
            (pair[0], pair[1])
        })
        .collect();

    // Split the pairs into left and right and sort them into ascending order
    let left: Vec<i32> = pairs.iter().map(|pair| pair.0).collect();
    let right: Vec<i32> = pairs.iter().map(|pair| pair.1).collect();


    let start = std::time::Instant::now();
    // Calculate the distance
    let part_1 = part1(left.clone(), right.clone());

    // Print the time taken
    println!("Part 1: [- {} -] at [- {:?} -]", part_1, start.elapsed());

    // Start a timer
    let start = std::time::Instant::now();
    let part_2 = part2(left.clone(), hashmap.clone());

    // Print the time taken
    println!("Part 2: [- {} -] at [- {:?} -]", part_2, start.elapsed());

    // Print the total time taken
    println!("Total time: [- {:?} -] \n", total_start.elapsed());
}

// Function to calculate the distance
// Take a clone of the left and right vectors to avoid borrowing issues

pub fn part1(mut left: Vec<i32>, mut right: Vec<i32>) -> i32 {
    // Sort the left and right vectors
    left.sort();
    right.sort();

    // Initialize the distance to 0
    let mut distance = 0;

    // Iterate through the left vector
    for i in 0..left.len() {
        // Calculate the difference between the left and right vectors
        let diff = left[i] - right[i];
        // Add the absolute value of the difference to the distance
        distance += diff.abs();
    }

    // Return the distance
    distance
}

// Function to calculate the number of occurrences of a number from the left vector in the right vector
// Take a clone of the left and right vectors to avoid borrowing issues
// Get rid of warning about unused mut variables
pub fn part2(mut left: Vec<i32>, mut hashmap: std::collections::HashMap<i32, i32>) -> i32 {
    // Initialize the count
    let mut score = 0;

    // Iterate through the left vector
    left.iter().for_each(|&num| {
        score += hashmap.get(&num).unwrap_or(&0) * num;
    });

    // Return the distance
    score
}
