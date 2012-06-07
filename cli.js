#!/usr/bin/env node

var quotebot = require('./')

if(process.argv.length < 4) {
  console.log('Usage: quotebot host channels ...')
  process.exit(1)
}

var host = process.argv[2],
    channels = process.argv.slice(3)

quotebot.connect(host, channels)

console.log('Quotebot connected to %s, ^C to disconnect', host)
