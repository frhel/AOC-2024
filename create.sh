#!/bin/bash

# Fail on error
set -e

# Read day number from command line
day=$1

# Create directory
mkdir -p day_$day
cd day_$day

# Create input files
# Normal input
touch in.txt
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
