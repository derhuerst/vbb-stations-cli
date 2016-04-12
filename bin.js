#!/usr/bin/env node
'use strict'

const chalk    = require('chalk')
const pRight   = require('pad-right')
const yargs    = require('yargs')
const stations = require('vbb-stations')
const tokenize = require('vbb-tokenize-station')
const filter   = require('stream-filter')



const formats = {

	  csv:    () => require('csv-write-stream')()
	, ndjson: () => require('ndjson').stringify()

	, pretty: () => require('through2').obj((s, _, cb) => cb(null, [
		  chalk.blue(s.id)
		, chalk.yellow(pRight(s.name.slice(0, 40), 40, ' '))
		, chalk.gray(pRight(s.latitude.toString().slice(0, 9), 9, ' '))
		, chalk.gray(pRight(s.longitude.toString().slice(0, 9), 9, ' '))
		, chalk.green(s.weight)
	].join(' ') + '\n'))
}



const argv = yargs.argv

if (argv.help || argv.h) {
	process.stdout.write([
		  'Usage:'
		, '    vbb [options] [filters]'
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
.pipe(format())
.pipe(process.stdout)
