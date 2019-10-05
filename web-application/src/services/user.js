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

module.exports = UserService;