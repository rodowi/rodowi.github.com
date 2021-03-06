var async = require("async");

// Terminal methods

var MESSAGES = {
  blog: "http://rodowi.github.io/refactor/",
  coderwall: "https://coderwall.com/wilhelmbot",
  github: "https://github.com/rodowi",
  help: "available commands are blog, coderwall, github, help, linkedin, npm, projects, twitter, whoami",
  linkedin: "https://www.linkedin.com/in/rodowi",
  npm: "https://www.npmjs.com/~rodowi",
  projects: "See my latest projects at https://github.com/mxabierto",
  twitter: "https://twitter.com/rodowi",
  unknown: "command not found: ",
  whoami: "I write computer programs."
};

var OPTIONS = {
  greetings: "Booting...",
  onBlur: function() { return false; },
  prompt: "guest@localhost ~ $ "
};

function help(term) {
  term.echo(MESSAGES.help);
}

function unknown(command, term) {
  term.error(MESSAGES.unknown + command);
  help(term);
}

function progress(percent, width) {
  var size = Math.round(width*percent/100);
  var left = '', taken = '', i;
  for (i=size; i--;) {
    taken += '=';
  }
  if (taken.length > 0) {
    taken = taken.replace(/=$/, '>');
  }
  for (i=width-size; i--;) {
    left += ' ';
  }
  return '[' + taken + left + '] ' + percent + '%';
}

var animation = false;
var timer;
var prompt;
var string;

function startLoading(term, done) {
  var i = 0, size = 80;
  prompt = term.get_prompt();
  string = progress(0, size);
  term.set_prompt(progress);
  animation = true;
  (function loop() {
    string = progress(i++, size);
    term.set_prompt(string);
    if (i < 100) {
      timer = setTimeout(loop, 20);
    } else {
      term.echo(progress(i, size) + ' [[b;green;]OK]')
      .set_prompt(prompt);
      animation = false;
      done();
    }
  })();
}

function type(term, message, done) {
  var sequence = [];

  for (var c = 0; c < message.length; c++) {
    var wfun = async.apply(write, message[c], Math.random() * 50 + 25);
    sequence.push(wfun);

    if (message[c] == '.')
      sequence.push(async.apply(write, '', 400));
    if (message[c] == '?')
      sequence.push(async.apply(write, '', 1500));
  }

  async.series(sequence, done);

  function write(char, delay, cb) {
    setTimeout(function () { cb(null, term.insert(char)) }, delay);
  }
}

// On document ready:

$(function() {

  // Initialize jQuery terminal
  var term = $('body').terminal(function(command, term) {
    if (command in MESSAGES)
      term.echo(MESSAGES[command]);
    else
      unknown(command, term);
  }, OPTIONS);

  var greeting = [
    'Hello friend. Here we are again.',
    'We wanted to save the world. Did you think it would be that easy?'
  ]

  async.series([
    async.apply(startLoading, term),
    async.apply(type, term, greeting.join(' '))
  ],
  function(err, results) {
    term.set_command('');
    term.echo('Our real work is just beginning. Now type something.');
  });

});
