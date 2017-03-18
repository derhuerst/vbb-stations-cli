# *vbb-stations-cli*

**Find and filter VBB stations from the command line.** Computed from [open](http://daten.berlin.de/datensaetze/vbb-fahrplandaten-januar-2017-bis-dezember-2017) [GTFS](https://developers.google.com/transit/gtfs/) [data](https://vbb-gtfs.jannisr.de/).

[![asciicast](https://asciinema.org/a/82500.png)](https://asciinema.org/a/82500)

[![npm version](https://img.shields.io/npm/v/vbb-stations-cli.svg)](https://www.npmjs.com/package/vbb-stations-cli)
[![build status](https://img.shields.io/travis/derhuerst/vbb-stations-cli.svg)](https://travis-ci.org/derhuerst/vbb-stations-cli)
[![dependency status](https://img.shields.io/david/derhuerst/vbb-stations-cli.svg)](https://david-dm.org/derhuerst/vbb-stations-cli)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/vbb-stations-cli.svg)](https://david-dm.org/derhuerst/vbb-stations-cli#info=devDependencies)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/vbb-stations-cli.svg)
[![gitter channel](https://badges.gitter.im/derhuerst/vbb-rest.svg)](https://gitter.im/derhuerst/vbb-rest)


## Installing

```shell
npm install -g vbb-stations-cli
```


## Usage

```
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
    Each filter must be an `Array.prototype.filter`-compatible funtion.

Examples:
    vbb
    vbb --name "berliner strasse"
    vbb --id 900000044201 --columns id,name,lines
    vbb "(s) => s.coordinates.latitude > 52" "(s) => s.coordinates.longitude > 12"
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-stations-cli/issues).
