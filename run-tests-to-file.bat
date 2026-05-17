@echo off
echo Running tests and saving output to test-output.txt...
npm test -- --no-coverage > test-output.txt 2>&1
echo Tests completed! Check test-output.txt for results.
