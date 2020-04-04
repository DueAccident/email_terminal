var cmdLine_
var output_

function testGet(arg) {
	$.get('config/network/' + arg + '/userlist.json', function(result) {
			console.log(result)
		})
		.done(function() {
			console.log(`ONLINE IF OK`)
		})
		.fail(function() {
			console.log('FAIL')
		})
}

function setHeader(msg = '') {
	// Setting correct header icon and terminal name
	if (serverDatabase.randomSeed && !logged)
		prompt_text = '[' + userDatabase.userName + date.getTime() + '@' + serverDatabase.terminalID + '] # '
	else
		prompt_text = '[' + userDatabase.userName + '@' + serverDatabase.terminalID + '] # '

	header = `
    <img align="left" src="config/network/` + serverDatabase.serverAddress + `/` + serverDatabase.iconName + `" width="100" height="100" style="padding: 0px 10px 20px 0px">
    <h2 style="letter-spacing: 4px">` + serverDatabase.serverName + `</h2>
    <p>Logged in: ` + serverDatabase.serverAddress + ` ( ` + date_final + ` ) </p>
    <p>Enter "help" for more information.</p>
    `
	system.clear()
	output([header, msg])
	$('.prompt').html(prompt_text)
}
/**
 * Cross-browser impl to get document's height.
 * 
 * This function is necessary to auto-scroll to the end of page after each terminal command.
 */
function getDocHeight_() {
	var d = document
	return Math.max(
		Math.max(d.body.scrollHeight, d.documentElement.scrollHeight),
		Math.max(d.body.offsetHeight, d.documentElement.offsetHeight),
		Math.max(d.body.clientHeight, d.documentElement.clientHeight)
	)
}

function newLine(object = cmdLine_) {
	window.scrollTo(0, getDocHeight_())
	object.value = '' // Clear/setup line for next input.
}

/**
 * A function to padronize every output/return as a terminal print/echo function.
 * 
 * The output function now can handle both String and Array objects.
 * 
 * @param {String} data The string to be returned as a print in terminal
 * @param {Object} data The array to be returned as a print in terminal
 */
function output(data) {
	return new Promise(function(resolve, reject) {

		if (typeof(data) == 'object') {
			$.each(data, function(index, value) {
				output_.insertAdjacentHTML('beforeEnd', '<p>' + value + '</p>')
			})
		}
		if (typeof(data) == 'string') {
			output_.insertAdjacentHTML('beforeEnd', '<p>' + data + '</p>')
		}
		resolve(newLine())

	})
}

/**
 * Isn't working as needed
 * Needs to work with output() to output things one at time (delayed software message)
 * 
 * @param {Number} milliseconds 
 */
function sleep(milliseconds) {
	const date = Date.now()
	let currentDate = null
	do {
		currentDate = Date.now()
	} while (currentDate - date < milliseconds)
}

// A list of terminal implemented functions (to show in help)
var CMDS_
var date

/**
 * The Kernel will handle all software (system calls).
 * 
 * The app name will be checked first if it exists as a system 'native' command.
 * If it doesn't, it will look for a custom software defined at software.json.
 * 
 * @param {String} app The app name
 * @param {Array} args A list of Strings as args
 */
var kernel = function(app, args) {

	if (system[app])
		return (system[app](args))

	else if (system[app.replace('.', '_')])
		return (system[app.replace('.', '_')](args))

	else
		return (software(app, args))

}

kernel.init = function(cmdLineContainer, outputContainer, definedDate) {
	return new Promise(function(resolve, reject) {
		cmdLine_ = document.querySelector(cmdLineContainer)
		output_ = document.querySelector(outputContainer)
		date = date

		CMDS_ = [
			'clear', 'date', 'echo', 'help', 'login', 'mail', 'read', 'ping', 'telnet'
		]

		$.when(
			$.get('config/network/' + serverDatabase.serverAddress + '/userlist.json', function(list) {
				userList = list
			}),
			$.get('config/network.json', function(networkList) {
				networkDatabase = networkList
			}),
			$.get('config/software.json', function(softwareList) {
				softwareDatabase = softwareList
			})
		).then(function() {
			resolve(true)
		})
	})
}

var system = {
	foo: function() {
		return new Promise(function(resolve, reject) {
			resolve("bar")
		})
	},

	whoami: function() {
		return new Promise(function(resolve, reject) {
			output(
				serverDatabase.serverAddress + `/` + userDatabase.userId
			)
		})
	},

	clear: function() {
		return new Promise(function(resolve, reject) {
			output_.innerHTML = ''
			cmdLine_.value = ''
			resolve(false)
		})
	},

	date: function() {
		return new Promise(function(resolve, reject) {
			resolve(String(date))
		})
	},

	echo: function(args) {
		return new Promise(function(resolve, reject) {
			resolve(args.join(' '))
		})
	},

	bar_exe: function() {
		return new Promise(function(resolve, reject) {
			resolve(`foobar.exe`)
		})
	},

	help: function(args) {
		return new Promise(function(resolve, reject) {
			if (args == '') {
				resolve([
					`You can read the help of a specific command by entering as follows: 'help commandName'`,
					`List of useful commands:`,
					'<div class="ls-files">' + CMDS_.join('<br>') + '</div>'
				])
			}
			if (args[0] == 'clear') {
				resolve([
					`Usage:`,
					`> clear`,
					`The clear command will completely wipeout the entire screen, but it will not affect the history or whatever have been made into the terminal.`
				])
			}
			if (args[0] == 'echo') {
				resolve([
					`Usage:`,
					`> echo args`,
					`The echo command will print args into terminal.`
				])
			}
			if (args[0] == 'login') {
				resolve([
					`Usage:`,
					`> login username@password`,
					`If you're a registered user into the server, you can login to access your data files and messages.`
				])
			}
			if (args[0] == 'read') {
				resolve([
					`Usage:`,
					`> read x`,
					`If you're logged in you can read your mail messages if any.`
				])
			}
			if (args[0] == 'telnet') {
				resolve([
					`Usage:`,
					`> telnet address`,
					`> telnet address@password`,
					`You can connect to a valid address to access a specific server if the server is at internet.`,
					`Intranet servers can only be accessed locally.`,
					`You may need a password if it isn't a public server.`
				])
			}
			if (args[0] == 'date') {
				resolve([
					`Usage:`,
					`> date`,
					`The date command will print the current date-time into terminal.`
				])
			}
			if (args[0] == 'help') {
				resolve([
					`Usage:`,
					`> help`,
					`The default help message.`,
					`It will show some of the available commands in a server.`,
					`Note that some existent commands may not have been show at help message.`
				])
			}
			if (args[0] == 'mail') {
				resolve([
					`Usage:`,
					`> mail`,
					`If you're logged in you can list your mail messages if any.`
				])
			}
			if (args[0] == 'ping') {
				resolve([
					`Usage:`,
					`> ping address`,
					`The ping command will try to reach a valid address.`,
					`If the ping doesn't return a valid response, the address may be incorrect, may not exist or can't be reached locally.`
				])
			}
		})
	},

	login: function(args) {
		var ans = []
		var userFound = false

		return new Promise(function(resolve, reject) {
			if (args == "")
				throw new UsernameIsEmptyError
			args = args[0].split('@')
			$.each(userList, function(index, value) {
				if (args[0] == value.userId && args[1] == value.password) {
					userFound = true
					userDatabase = value
					logged = true
				}
			})
			if (!userFound)
				throw new UsernameIsEmptyError
			resolve(setHeader('Login successful'))
		})

	},

	logout: function() {
		return new Promise(function(resolve, reject) {
			if (!logged)
				throw new LoginIsFalseError

			logged = false
			userDatabase = serverDatabase.defaultUser
			resolve(setHeader('Logout completed'))
		})
	},

	mail: function() {
		return new Promise(function(resolve, reject) {
			if (!logged)
				throw new LoginIsFalseError

			var ans = []

			$.each(userDatabase.mail, function(index, mail) {
				ans.push(`[` + index + `] ` + mail.title)
			})

			if (ans == "")
				throw new MailServerIsEmptyError

			resolve(ans)
		})
	},

	read: function(args) {
		return new Promise(function(resolve, reject) {
			if (!logged)
				throw new LoginIsFalseError

			var ans = []

			readOption = false
			$.each(userDatabase.mail, function(index, mail) {
				if (args[0] == index) {
					readOption = true
					ans.push(`---------------------------------------------`)
					ans.push(`From: ` + mail.from)
					ans.push(`To: ` + userDatabase.userId + `@` + serverDatabase.terminalID)
					ans.push(`---------------------------------------------`)

					$.each(mail.body.split("  "), function(i, b) {
						ans.push(b)
					})
				}
			})

			if (!readOption)
				ans.push(`Invalid message key`)

			resolve(ans)
		})
	},

	ping: function(args) {
		return new Promise(function(resolve, reject) {
			if (args == "")
				throw new AddressIsEmptyError

			serverFound = false
			$.each(networkDatabase, function(index, value) {
				if (value.serverAddress == args) {
					serverFound = true
					resolve(`Server ` + value.serverAddress + ` (` + value.serverName + `) can be reached`)
				}
			})

			if (!serverFound)
				throw new AddressNotFoundError(args)
		})
	},

	telnet: function(args) {
		return new Promise(function(resolve, reject) {
			if (args == "")
				throw new AddressIsEmptyError

			serverFound = false
			$.each(networkDatabase, function(index, value) {
				if (value.serverAddress == args) {
					serverFound = true
					logged = false // Lost email access if previous login
					serverDatabase = value
					userDatabase = serverDatabase.defaultUser
					userList = serverDatabase.userList
					// serverFiles = value.serverFiles

					resolve(setHeader('Connection successful'))
				}
			})

			if (!serverFound)
				throw new AddressNotFoundError(args)
		})
	}
}

var software = function(app, args) {
	return new Promise(function(resolve, reject) {

		appName = app.split('.')[0]
		appFiletype = app.split('.')[1]

		$.get('config/software/' + appName + '.json', function(softwareInfo) {
				console.log(softwareInfo)
				if (
					appFiletype == softwareInfo[appName].filetype &&
					softwareInfo[appName].location.includes(serverDatabase.serverAddress) &&
					softwareInfo[appName].protection.includes(userDatabase.userId)
				)
					resolve(softwareInfo[appName].message)
				else
					reject(new CommandNotFoundError(app))
			})
			.fail(function() {
				reject(new CommandNotFoundError(app))
			})

	})
}