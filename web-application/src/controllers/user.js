'use strict'

const UserService = require('../services/user');
const BankService = require('../services/bank');

const userService = new UserService();
const bankService = new BankService();

function UserController() {}

UserController.prototype.queryUserInformation = async ( req , res ) => {

	const
		username = req.user.username;

	const userInformation = await userService.queryUserInformation( username );

	res.render('user' , { userInformation : userInformation } );

}

UserController.prototype.updateAddress = async ( req , res ) => {

	const
		key = req.body.key,
		newAddress = req.body.newAddress;

	await userService.updateAddress( key , newAddress );

	res.redirect('/');
} 

UserController.prototype.updatePassword = async ( req , res ) => {

	const
		key = req.body.key,
		newPassword = req.body.newPassword;

	await userService.updatePassword( key , newPassword );

	res.redirect('/');
}

UserController.prototype.queryUserAccountInformation = async ( req , res ) => {

	const username = req.user.username;

	const userInformation = await userService.queryUserInformation( username );

	res.render('password' , { userInformation : userInformation } );

}

UserController.prototype.queryUserBankAccount = async ( req , res ) => {

	const id = req.user.id;

	const bankAccount = await bankService.queryUserBankAccount( id );

	res.render('bank-account' , { userInformation : req.user , bankAccount : bankAccount });
}

module.exports = UserController;