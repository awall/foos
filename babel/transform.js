const Fs = require('fs')
const Babel = require('./babel-standalone.js')

const inputFileName = '../src/' + process.argv[2]
const outputFileName = '../static/' + process.argv[2].slice(0, -1)
const contents = Fs.readFileSync(inputFileName, 'utf-8')

const output = Babel.transform(contents, { plugins: ['proposal-class-properties'], presets: ['react'] }).code

Fs.writeFileSync(outputFileName, output)

