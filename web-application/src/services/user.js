'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();

function UserService() {}

UserService.prototype.queryAllEmployees = async () => {

	const contractName = "User";
	const queryType = "queryAllUsers";

	const result = await fabric.queryAllUsers();

	let employees = [];

	result.forEach( ( employee ) => {
		employees.push(employee['Record']);
	});
	
	return employees;
}

UserService.prototype.updateAddress = async ( key , newAddress ) => {

	await fabric.updateAddress( key , newAddress );
}

UserService.prototype.queryUserInformation = async ( username ) => {

	const contractName = "User";
	const queryType = "queryByUsername";

	const userInformation = await fabric.queryByIndex( contractName , queryType , username );	

	return userInformation[0];

}

UserService.prototype.updatePassword = async ( key , newPassword ) => {

	await fabric.updatePassword( key, newPassword );
}

module.exports = UserService;