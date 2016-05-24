#!/usr/bin/env node
'use strict'

const csv      = require('csv-write-stream')
const ndjson   = require('ndjson')
const through  = require('through')
const chalk    = require('chalk')
const shorten  = require('vbb-short-station-name')
const pLeft    = require('pad-left')
const pRight   = require('pad-right')
const linesAt  = require('vbb-lines-at')
const cliWidth = require('window-size').width
const truncate = require('cli-truncate')



const col = (x, p, l) => p(x.toString().slice(0, l), l, ' ')

module.exports = {

	  csv: () => csv()
	, ndjson: () => ndjson.stringify()



	, pretty: (columns) => through.obj((s, _, cb) => {
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
		if (columns.lines) {
			let lines = linesAt[s.id]
			if (lines) line.push('  ' + lines
				.map((l) => l.name).join(' '))
		}
		return cb(null, truncate(line.join(' '), cliWidth || 80) + '\n')
	})

}
