'use strict'

const LocalStrategy = require('passport-local');
const UserService = require('../services/user');
const userService = new UserService();

function AuthenticationController() {}

AuthenticationController.prototype.strategy = () => {

	const strategy = new LocalStrategy(

	 	async function( username, password, done ) {

				const users =  await userService.queryAllEmployees();

				let user = null;

				for( let i = 0; i < users.length; i++ ){

					if(users[i].username == username && users[i].password == password ) {
						user = users[i];
						break;
					}
				}

				console.log(user);
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
