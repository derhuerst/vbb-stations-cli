# *vbb-stations-cli*

Find and filter VBB stations from the command line. [ISC-licensed](license.md).

[![npm version](https://img.shields.io/npm/v/vbb-stations-cli.svg)](https://www.npmjs.com/package/vbb-stations-cli)
[![dependency status](https://img.shields.io/david/derhuerst/vbb-stations-cli.svg)](https://david-dm.org/derhuerst/vbb-stations-cli)
[![dev dependency status](https://img.shields.io/david/dev/derhuerst/vbb-stations-cli.svg)](https://david-dm.org/derhuerst/vbb-stations-cli#info=devDependencies)


## Installing

```shell
npm install -g vbb-stations-cli
```


## Usage

```
Usage:
    vbb [options] [filters]

Options:
    --id        <value>          Filter by id.
    --name      <value>          Filter by name.
    --latitude  <value>          Filter by latitude.
    --longitude <value>          Filter by longitude.
    --weight    <value>          Filter by weight.
    --format    <pretty|ndjson>  Default is pretty.

Filters:
    Each filter must be an See `Array.prototype.filter`-compatible funtion.

Examples:
    vbb # shows all stations
    vbb --id 9003104
    vbb "(s) => s.latitude > 52" "(s) => s.latitude > 12"
```


## Contributing

If you **have a question**, **found a bug** or want to **propose a feature**, have a look at [the issues page](https://github.com/derhuerst/vbb-stations-cli/issues).
