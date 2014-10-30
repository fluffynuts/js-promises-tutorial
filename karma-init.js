var sys = require('sys')
var exec = require('child_process').exec
var readline = require('readline');
var lineReader = readline.createInterface({
        input: process.stdin,
        output: process.stdout
});

function installPackage(name) {
    exec("npm install --save-dev " + name);
}

function ask(question, possibleAnswers, defaultAnswer, callback) {
    var myPossibleAnswers = [];
    possibleAnswers.forEach(function(item) {
        if (item === defaultAnswer) {
            myPossibleAnswers.push(item.toUpperCase());
        } else {
            myPossibleAnswers.push(item);
        }
    });
    lineReader.question(question + " (" + (myPossibleAnswers.join(",")) + ") ", function(answer) {
        if (answer === "") {
            callback(defaultAnswer);
            return;
        }
        var exactMatch = possibleAnswers.indexOf(answer);
        if (exactMatch === -1) {
            var matches = [];
            possibleAnswers.forEach(function(item) {
                if (item.toLowerCase().indexOf(answer.toLowerCase()) === 0) {
                    matches.push(item);
                }
            });
            if (matches.length === 1) {
                callback(matches[0]);
            } else{
                console.log("Invalid selection. Try again.\n");
                ask(question, possibleAnswers, defaultAnswer, callback);
            }
        } else {
            callback(answer);
        }
    });
}

var packages = ["karma", "karma-xml-reporter", "karma-jasmine"];
function performInstallations() {
    console.log(JSON.stringify(installRunners));
    packages.forEach(function(item) {
        installPackage(item);
    });
    exec("karma init");
    process.exit(0);
}

console.log("Initialising Karma for your project. Please hold...");

var installRunners = {
    ie: false,
    phantom: false,
    chrome: true,
    firefox: false
};

function yesno(answer) {
    if (typeof(answer) === 'boolean') {
        return answer ? "y": "n";
    }
    return (answer.toLowerCase().indexOf('y') === 0);
}

console.log("Please select one or more karma launchers to install:");
function createYesNoQuestion(text, optionName, nextFunction) {
    var answers = ["y", "n"];
    return function() {
        ask(text, answers, yesno(installRunners[optionName]), function(answer) {
            var selected = yesno(answer);
            installRunners[optionName] = selected;
            if (nextFunction !== undefined) {
                nextFunction();
            }
        })
    };
}

var askFirefox = createYesNoQuestion("Install for Firefox?", "firefox", performInstallations);
var askChrome = createYesNoQuestion("Install for Chrome?", "chrome", askFirefox);
var askPhantom = createYesNoQuestion("Install for Phantom?", "phantom", askChrome);
var askIE = createYesNoQuestion("Install for IE?", "ie", askPhantom);

askIE();


