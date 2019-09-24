'use strict'

const 
	LocalStrategy = require('passport-local'),
	fs = require('fs'),
	path = require('path');

function AuthenticationController() {}

AuthenticationController.prototype.strategy = () => {

	const strategy = new LocalStrategy(

		function( username, password, done ) {

				const userPath = path.resolve(__dirname, '..' , '..' , 'users.json');
				const userList = fs.readFileSync(userPath, 'utf8');
				const users = JSON.parse(userList);

				let user = null;

				for( let i = 0; i < users['users'].length; i++ ){
					if(users['users'][i].username == username && users['users'][i].password == password ) {
						user = users['users'][i];
						break;
					}
				}
				return done(null, user);
		  }
	);

	return strategy;
}

AuthenticationController.prototype.serialize = ( user , done ) => {
	 done(null, user);
}

AuthenticationController.prototype.deserialize = ( user , done ) => {
	 done(null, user);
}

module.exports = AuthenticationController;
