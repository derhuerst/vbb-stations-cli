#!/usr/bin/env node
'use strict'

const chalk    = require('chalk')
const shorten  = require('vbb-short-station-name')
const pLeft    = require('pad-left')
const pRight   = require('pad-right')
const linesAt  = require('vbb-lines-at')
const cliWidth = require('window-size').width
const truncate = require('cli-truncate')
const yargs    = require('yargs')
const stations = require('vbb-stations')
const tokenize = require('vbb-tokenize-station')
const filter   = require('stream-filter')



const col = (x, p, l) => p(x.toString().slice(0, l), l, ' ')

const formats = {

	  csv:    () => require('csv-write-stream')()
	, ndjson: () => require('ndjson').stringify()

	, pretty: (columns) => require('through2').obj((s, _, cb) => {
		const line = []
		if (columns.id) line.push(chalk.blue(s.id))
		if (columns.coords) {
			const lat    = col(s.latitude,  pRight, 9)
			const long   = col(s.longitude, pRight, 9)
			line.push(chalk.gray(lat + ' ' + long))
		}
		if (columns.weight) line.push(chalk.green(col(s.weight, pLeft, 6)))
		if (columns.name) {
			const name = shorten(s.name).slice(0, 35)
			line.push(chalk.yellow(name))
		}
		return cb(null, truncate(line.join(' '), cliWidth) + '\n')
	})
}



const argv = yargs.argv

if (argv.help || argv.h) {
	process.stdout.write([
		  'Usage:'
		, '    vbb-stations [options] [filters]'
		, ''
		, 'Options:'
		, '    --id        <value>             Filter by id.'
		, '    --name      <value>             Filter by name.'
		, '    --latitude  <value>             Filter by latitude.'
		, '    --longitude <value>             Filter by longitude.'
		, '    --weight    <value>             Filter by weight.'
		, '    --format    <csv|ndjson|pretty> Default is pretty.'
		, ''
		, 'Filters:'
		, '    Each filter must be an `Array.prototype.filter`-compatible funtion.'
		, ''
		, 'Examples:'
		, '    vbb'
		, '    vbb --name "berliner strasse"'
		, '    vbb --id 9003104'
		, '    vbb "(s) => s.latitude > 52" "(s) => s.latitude > 12"'
	].join('\n') + '\n')
	process.exit()
}



let selection = {}
if ('id'        in argv) selection.id        = parseInt(argv.id)
if ('latitude'  in argv) selection.latitude  = parseFloat(argv.latitude)
if ('longitude' in argv) selection.longitude = parseFloat(argv.longitude)
if ('weight'    in argv) selection.weight    = parseFloat(argv.weight)

if (Object.keys(selection).length === 0) selection = 'all'
const filters = argv._.map(eval)
const format = formats[argv.format] || formats.pretty

let columns = (argv['columns'] || 'id,coords,weight,name').split(',')
.reduce((acc, column) => {acc[column] = true; return acc}, {})



let stream = stations(selection)

if (argv.name && argv.name.length > 0) {
	const fragments = tokenize(argv.name)
	stream = stream.pipe(filter((station) => {
		const tokens = tokenize(station.name)
		for (let fragment of fragments) {
			if (tokens.indexOf(fragment) < 0) return false
		}
		return true
	}))
}

stream
.pipe(filter((s) => {
	for (let filter of filters) {
		if (!filter(s)) return false
	}
	return true
}))
.pipe(format(columns))
.pipe(process.stdout)
