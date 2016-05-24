#!/usr/bin/env node
'use strict'

const combine  = require('duplexer')
const csv      = require('csv-write-stream')
const ndjson   = require('ndjson')
const map      = require('through2-map')
const chalk    = require('chalk')
const shorten  = require('vbb-short-station-name')
const pLeft    = require('pad-left')
const pRight   = require('pad-right')
const cliWidth = require('window-size').width
const truncate = require('cli-truncate')



const col = (x, p, l) => p(x.toString().slice(0, l), l, ' ')

module.exports = {

	  csv: () => {
	  	const a = map.obj((s) => {
			s.lines = s.lines.map((l) => l.name).join(',')
			return s
		})
		const b = a.pipe(csv())
		return combine(a, b)
	}
	  // csv: () => csv()
	, ndjson: () => ndjson.stringify()



	, pretty: (columns) => map.obj((s) => {
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
		if (columns.lines && s.lines)
			line.push('  ' + s.lines.map((l) => l.name).join(' '))
		return truncate(line.join(' '), cliWidth || 80) + '\n'
	})

}
