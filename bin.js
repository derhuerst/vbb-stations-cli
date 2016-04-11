#!/usr/bin/env node
'use strict'

const chalk    = require('chalk')
const pRight   = require('pad-right')
const yargs    = require('yargs')
const search   = require('vbb-find-stations')
const stations = require('vbb-stations')
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
argv.query = argv._.shift()

if (argv.help || argv.h) {
	process.stdout.write([
		  'Usage:'
		, '    vbb [query] [options] [filters]'
		, ''
		, 'Arguments:'
		, '    query       Search for a station by name.'
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
		, '    Each filter must be an See `Array.prototype.filter`-compatible funtion.'
		, ''
		, 'Examples:'
		, '    vbb # shows all stations'
		, '    vbb Wittenbergplatz'
		, '    vbb --id 9003104'
		, '    vbb "(s) => s.latitude > 52" "(s) => s.latitude > 12"'
	].join('\n') + '\n')
	process.exit()
}



let selection = {}
if ('id'        in argv) selection.id        = parseInt(argv.id)
if ('name'      in argv) selection.name      = argv.name
if ('latitude'  in argv) selection.latitude  = parseFloat(argv.latitude)
if ('longitude' in argv) selection.longitude = parseFloat(argv.longitude)
if ('weight'    in argv) selection.weight    = parseFloat(argv.weight)

if (Object.keys(selection).length === 0) selection = 'all'

const filters = argv._.map(eval)

const format = formats[argv.format] || formats.pretty



if ('string' === typeof argv.query && argv.query.length > 0) {
	const ids = []
	search(argv.query)
	.on('data', (s) => ids.push(s.id))
	.on('end', () => onStream(stations(selection)
		.pipe(filter((s) => ids.indexOf(s.id) >= 0))))
} else onStream(stations(selection))

const onStream = (stream) => stream
	.pipe(filter((s) => {
		for (let filter of filters) {
			if (!filter(s)) return false
		}
		return true
	}))
	.pipe(format())
	.pipe(process.stdout)
