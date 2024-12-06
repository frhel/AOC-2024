#!/bin/bash

# Fail on error
set -e

# Read day number from command line
day=$1

# Get the variables from the .env file
if [ -f .env ]; then
	set -a
	source .env
	set +a
else
	echo "No .env file found. What is your Advent of Code session key?"
	read AOC_SESSION_KEY
	echo "AOC_SESSION_KEY=$AOC_SESSION_KEY" > .env
fi

# Create directory for the day
mkdir -p day_$day
cd day_$day

# Create input files
# Normal input. Downloaded from Advent of Code website
# If the file already exists, don't overwrite it
if [ -f ../inputs/day_$day.txt ]; then
	echo "Input file already exists. Skipping download."
else
	curl -s "https://adventofcode.com/2024/day/$day/input" -H "cookie: session=$AOC_SESSION_KEY" > ../inputs/day_$day.txt
fi

# If we downloaded the placeholder, delete it and create an empty file
# otherwise, copy the input file to in.txt
if head -n 1 ../inputs/day_$day.txt | (grep -q "Please don't" || grep -q "Puzzle inputs"); then
	rm ../inputs/day_$day.txt
	touch in.txt
else
	cp ../inputs/day_$day.txt in.txt
fi

# Example input
touch ex.txt

# Initialize project
npm init es6 -y

# Install chalk
npm install chalk

# Copy index.js template
cp ../solution_template.js solution.js

# Change day number in index.js from const day = 0; to const day = $day;
if [ $day -lt 10 ]; then
	day="0$day"
fi
sed -i "s/const _DAY = '0';/const _DAY = '$day';/" solution.js

# Change the main script name in package.json
sed -i "s/\"main\": \"index.js\",/\"main\": \"solution.js\",/" package.json

# Set up the npm run scripts
sed -i "s/\"dev\": \"\"/\"example\": \"nodemon --exec 'node --experimental-modules solution.js ex.txt'\"/" package.json
sed -i "s/\"test\": \"\"/\"start\": \"node --experimental-modules solution.js in.txt\"/" package.json

code solution.js
code in.txt
code ex.txt
npm run example
