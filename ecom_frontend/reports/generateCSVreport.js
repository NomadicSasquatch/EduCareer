const fs = require('fs');
const path = require('path');
const { parse } = require('json2csv');

// Correct paths to report.json and output CSV
const reportPath = path.join(__dirname, 'report.json'); // File in the same directory as generateCSVreport.js
const outputCsvPath = path.join(__dirname, 'test-report.csv');

// Read and parse the JSON report
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));

// Extract test cases recursively
const extractTestCases = (suite, testCases = []) => {
  if (suite.tests && suite.tests.length > 0) {
    suite.tests.forEach((test) => {
      testCases.push({
        requirementID: test.title.split(':')[0] || 'N/A', // Extract requirement ID if formatted
        description: test.title.split(':').slice(1).join(':').trim() || test.title, // Test description
        status: test.state || 'unknown', // Status: passed/failed/skipped
        duration: `${test.duration || 0} ms`, // Test duration
        error: test.err.message || '', // Error message if any
      });
    });
  }

  if (suite.suites && suite.suites.length > 0) {
    suite.suites.forEach((childSuite) => {
      extractTestCases(childSuite, testCases);
    });
  }

  return testCases;
};

// Extract test cases from the report
const testCases = [];
report.results.forEach((result) => {
  extractTestCases(result, testCases);
});

// Convert to CSV format
const fields = ['requirementID', 'description', 'status', 'duration', 'error'];
const opts = { fields };
const csv = parse(testCases, opts);

// Write CSV to a file
fs.writeFileSync(outputCsvPath, csv);

console.log(`CSV report generated at: ${outputCsvPath}`);
