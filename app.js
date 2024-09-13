

const express = require('express');
const parser = require('@babel/parser');
const generator = require('@babel/generator').default;
const traverse = require('@babel/traverse').default;
const cors = require('cors');
const app = express();
const router = express.Router();
app.use(express.json()); // Middleware to parse JSON request body
app.use(cors());
// Function to transform code: replace double quotes and single quotes with backticks,
// add semicolons, remove comments, and generate multi-line output with quotes on each line
function transformCodeMultiLine(code) {
    // Replace both double quotes and single quotes with backticks
    code = code.replace(/["']/g, "`");

    // Split code into lines
    const lines = code.split('\n');

    // Find the index of the last non-empty line starting with 'return'
    let lastNonEmptyLineIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() !== '') {
            if (lines[i].trim().startsWith('return')) {
                lastNonEmptyLineIndex = i;
            }
            break;
        }
    }

    // Remove the last non-empty line if it starts with 'return'
    let lastLine = '';
    if (lastNonEmptyLineIndex !== -1) {
        lastLine = lines[lastNonEmptyLineIndex].trim();
        lines.splice(lastNonEmptyLineIndex, 1);
    }

    // Join the remaining lines back into a single code string
    const codeWithoutLastLine = lines.join('\n');

    // Parse the code into an AST
    const ast = parser.parse(codeWithoutLastLine, {
        sourceType: 'module', // Set to 'module' for ES6 modules
        plugins: ['jsx', 'typescript'], // Add necessary plugins based on your codebase
        comments: true, // Preserve comments during parsing
    });

    // Traverse the AST
    traverse(ast, {
        ExpressionStatement(path) {
            // Add semicolons where missing
            if (!path.node.extra || !path.node.extra.parenthesized) {
                path.node.extra = { ...path.node.extra, semicolon: true };
            }
        },
        enter(path) {
            // Remove comments attached to any node
            if (path.node.leadingComments) {
                path.node.leadingComments = [];
            }
            if (path.node.trailingComments) {
                path.node.trailingComments = [];
            }
            if (path.node.innerComments) {
                path.node.innerComments = [];
            }
        }
    });

    // Generate code with semicolons and without comments
    const output = generator(ast, {
        retainLines: true, // Keep original line structure 
        concise: false, // Generate non-concise output to keep formatting
        comments: false, // Disable comments in the output
    });

    // Split the generated code into lines
    const transformedLines = output.code.split('\n');

    // Filter out empty or whitespace-only lines, then wrap each line with double quotes
    const wrappedLines = transformedLines
        .filter(line => line.trim() !== '') // Remove empty or whitespace-only lines
        .map(line => `"${line}"`);

    // Add the last non-empty line back if it was removed
    if (lastLine.startsWith('return')) {
        wrappedLines.push(`"${lastLine}"`);
    }

    // Join the wrapped lines with newlines
    return wrappedLines.join('\n');
}

// Function to transform code: replace double quotes and single quotes with backticks,
// add semicolons, remove comments, and generate single-line output enclosed in double quotes
function transformCodeSingleLine(code) {
    // Replace both double quotes and single quotes with backticks
    code = code.replace(/["']/g, "`");

    // Split code into lines
    const lines = code.split('\n');

    // Find the index of the last non-empty line starting with 'return'
    let lastNonEmptyLineIndex = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
        if (lines[i].trim() !== '') {
            if (lines[i].trim().startsWith('return')) {
                lastNonEmptyLineIndex = i;
            }
            break;
        }
    }

    // Remove the last non-empty line if it starts with 'return'
    let lastLine = '';
    if (lastNonEmptyLineIndex !== -1) {
        lastLine = lines[lastNonEmptyLineIndex].trim();
        lines.splice(lastNonEmptyLineIndex, 1);
    }

    // Join the remaining lines back into a single code string
    const codeWithoutLastLine = lines.join('\n');

    // Parse the code into an AST
    const ast = parser.parse(codeWithoutLastLine, {
        sourceType: 'module', // Set to 'module' for ES6 modules
        plugins: ['jsx', 'typescript'], // Add necessary plugins based on your codebase
        comments: true, // Preserve comments during parsing
    });

    // Traverse the AST
    traverse(ast, {
        ExpressionStatement(path) {
            // Add semicolons where missing
            if (!path.node.extra || !path.node.extra.parenthesized) {
                path.node.extra = { ...path.node.extra, semicolon: true };
            }
        },
        enter(path) {
            // Remove comments attached to any node
            if (path.node.leadingComments) {
                path.node.leadingComments = [];
            }
            if (path.node.trailingComments) {
                path.node.trailingComments = [];
            }
            if (path.node.innerComments) {
                path.node.innerComments = [];
            }
        }
    });

    // Generate code with semicolons and without comments
    const output = generator(ast, {
        retainLines: true, // Keep original line structure 
        concise: false, // Generate non-concise output to keep formatting
        comments: false, // Disable comments in the output
    });

    // Split the generated code into lines
    const transformedLines = output.code.split('\n');

    // Filter out empty or whitespace-only lines and join them into a single string
    const finalString = transformedLines
        .filter(line => line.trim() !== '') // Remove empty or whitespace-only lines
        .join(' '); // Join lines with newlines to create a single string

    // Add the last non-empty line back if it was removed
    if (lastLine.startsWith('return')) {
        return `"${finalString} ${lastLine}"`;
    }

    // Enclose the entire output in double quotes
    return `"${finalString}"`;
}

// Multi-line transformation endpoint
router.post('/transform/multi-line', (req, res) => {
    const { code } = req.body;
    console.log(code)
    const transformedCode = transformCodeMultiLine(code);

    res.send(transformedCode);
});

// Single-line transformation endpoint
router.post('/transform/single-line', (req, res) => {
    const { code } = req.body;
    const transformedCode = transformCodeSingleLine(code);
    res.send(transformedCode);
});

app.use('/.netlify/functions/index', router);
module.exports = app;
