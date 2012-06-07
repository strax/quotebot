#!/usr/bin/env node

var request = require('request'),
    csv2json = require('csv2json'),
    format = require('util').format

if(process.argv.length < 4) {
  console.log("Usage: quotebot server [channels ...]")
  process.exit(1)
}

function quote(symbol, cb) {
  var columns = ['symbol', 'exchange', 'quote', 'change', 'range']
  var uri = format("http://download.finance.yahoo.com/d/quotes.csv?s=%s&f=sxl1cw", symbol)
  request(uri).pipe(csv2json(columns)).on('data', function(data) {
    cb(JSON.parse(data))
  })
}

function graph(symbol, width, height) {
  return format("http://chart.finance.yahoo.com/t?s=%s&lang=en-US&region=US&width=%d&height=%d", symbol, width || 500, height || 200)
}

var irc = require('irc')

var bot = new irc.Client(process.argv[2], 'quotebot', {
  port: 6667,
  channels: process.argv.slice(3),
  realName: 'Stock quotes',
  debug: true
})

bot.on('message', function(from, to, message) {
  if(/^quotebot/.test(message)) {
    message = message.replace(/^quotebot(.+)\s+/, '')
    quote(message, function(json) {
      require('goo.gl').shorten(graph(json.symbol), function(uri) {
        if(json.quote == 0) {
          bot.say(to, from + ": No such quote")
        } else {
          bot.say(to, from + ': ' + format(
            '%s %d %s, 52w %s %s',
            json.symbol, json.quote, json.change, json.range, uri.id))
        }
      })
    })
  }
})

bot.on('error', function(err) {
  console.error(err)
})
