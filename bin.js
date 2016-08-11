#!/usr/bin/env node
'use strict'

const yargs    = require('yargs')
const stations = require('vbb-stations')
const tokenize = require('vbb-tokenize-station')
const linesAt  = require('vbb-lines-at')

const formats  = require('./formats')



const argv = yargs.argv

if (argv.help || argv.h) {
	process.stdout.write(`
Usage:
    vbb-stations [options] [filters]

Options:
    --id        <value>             Filter by id.
    --name      <value>             Filter by name.
    --latitude  <value>             Filter by latitude.
    --longitude <value>             Filter by longitude.
    --weight    <value>             Filter by weight.
    --format    <csv|ndjson|pretty> Default is pretty.
    --columns   <value>,<value>,…   Default is id,coords,weight,name,lines.

Filters:
    Each filter must be an \`Array.prototype.filter\`-compatible funtion.

Examples:
    vbb
    vbb --name "berliner strasse"
    vbb --id 9003104 --columns id,name,lines
    vbb "(s) => s.latitude > 52" "(s) => s.latitude > 12"
\n`)
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

const columns = (argv['columns'] || 'id,coords,weight,name,lines').split(',')
Object.assign(columns, columns
	.reduce((columns, column) => {columns[column] = true; return columns}, {}))



let list = stations(selection)

// filter by name
if (argv.name && argv.name.length > 0) {
	const fragments = tokenize(argv.name)
	list = list.filter((station) => {
		const tokens = tokenize(station.name)
		for (let fragment of fragments) {
			if (tokens.indexOf(fragment) < 0) return false
		}
		return true
	})
}

// enhance with lines
if (columns.lines) list = list.map((station) => {
	station.lines = linesAt[station.id] || []
	return station
})

// filter by fn
if (filters.length > 0) list = list.filter((station) => {
	for (let filter of filters) {
		if (!filter(station)) return false
	}
	return true
})

format(columns, list, process.stdout)
