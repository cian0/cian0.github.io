const fs = require('fs');
const { translate } = require('./translator');

// Test JSON to TXT conversion
console.log('Testing JSON to TXT conversion:');
const jsonInput = JSON.parse(fs.readFileSync('ball-kicked-effect.json', 'utf8'));
const txtOutput = translate(jsonInput, 'txt');
console.log(txtOutput);
fs.writeFileSync('output.txt', txtOutput);
console.log('TXT output saved to output.txt');

// Test TXT to JSON conversion
console.log('\nTesting TXT to JSON conversion:');
const txtInput = fs.readFileSync('output.txt', 'utf8');
const jsonOutput = translate(txtInput, 'json');
console.log(JSON.stringify(jsonOutput, null, 2));
fs.writeFileSync('output.json', JSON.stringify(jsonOutput, null, 2));
console.log('JSON output saved to output.json');

// Compare original JSON with converted JSON
console.log('\nComparing original JSON with converted JSON:');
const originalJson = JSON.stringify(jsonInput);
const convertedJson = JSON.stringify(jsonOutput);
console.log('Are they identical?', originalJson === convertedJson);

if (originalJson !== convertedJson) {
  console.log('Differences found. Please check the output files for details.');
} else {
  console.log('Conversion successful! The data remains intact after conversion.');
}