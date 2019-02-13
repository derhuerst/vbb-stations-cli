#!/usr/bin/env node
'use strict'

const toCsv = require('d3-dsv').csvFormat
const pick = require('lodash.pick')
const chalk    = require('chalk')
const padRight   = require('pad-right')
const shorten  = require('vbb-short-station-name')
const padLeft    = require('pad-left')
const truncate = require('cli-truncate')
const cli = require('window-size')



const csv = (columns, stations, out) => {
	if (columns.coords)
		columns.splice(columns.indexOf('coords'), 1, 'latitude', 'longitude')
	if (columns.lines) for (let station of stations)
		station.lines = station.lines.map((line) => line.name).join(',')
	out.write(toCsv(stations, columns) + '\n')
}

const ndjson = (columns, stations, out) => {
	for (let station of stations)
		out.write(JSON.stringify(pick(station, columns)) + '\n')
}



const column = (value, pad, width) =>
	pad(truncate(value.toString(), width), width, ' ')

const pretty = (columns, stations, out) => {
	for (let station of stations) {
		const line = []
		if (columns.id) line.push(chalk.blue(station.id))
		if (columns.coords) {
			if (station.location) {
				line.push(chalk.gray(
					  column(station.location.latitude, padRight, 9)
					+ ' '
					+ column(station.location.longitude, padRight, 9)
				))
			} else line.push('')
		}
		if (columns.weight)
			line.push(chalk.green(column(station.weight, padLeft, 6)))
		if (columns.name)
			line.push(chalk.yellow(truncate(shorten(station.name), 35)))
		if (columns.lines && station.lines)
			line.push('  ' + station.lines.map((line) => line.name).join(' '))
		out.write(truncate(line.join(' '), cli.width || 80) + '\n')
	}
}

const json = (columns, stations, out) => {
	out.write('[')
	for (const station of stations) {
		out.write(JSON.stringify(pick(station, columns)) + ',\n')
	}
	out.write(']')
}

module.exports = {csv, ndjson, pretty, json}
