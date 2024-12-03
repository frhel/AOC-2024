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
cp ../index_template.js index.js

# Change day number in index.js from const day = 0; to const day = $day;
if [ $day -lt 10 ]; then
	day="0$day"
fi
sed -i "s/const _DAY = '0';/const _DAY = '$day';/" index.js
