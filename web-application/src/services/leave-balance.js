'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();

function LeaveBalanceService() {}

/**
 * Query the list of all existing record of leave balance
 *
 */
LeaveBalanceService.prototype.queryAllLeaveBalances = async () => {
	const contractName = 'LeaveBalance';
	const contractMethod = 'queryAllLeaveBalances';

	const result = await fabric.query(contractName, contractMethod);

	return result;
}

/**
 * Deduct the number of leaves taken by employee
 *
 */
LeaveBalanceService.prototype.deductLeaveBalance = async ( leaveBalance , noOfDays ) => {

	const key = leaveBalance.Key;
	const currentBalance = parseInt(leaveBalance.Record.annualLeave);
	const deductible = parseInt(noOfDays);
	const remainder = currentBalance - deductible;

	console.log(remainder);
	await fabric.updateLeaveBalance( key , remainder.toString() );

}

/**
 * Create new record of leave balance for new employee
 *
 */
LeaveBalanceService.prototype.createLeaveBalance = async () => {

}

/**
 * Query the remaining number of leave of employee
 */
LeaveBalanceService.prototype.queryLeaveBalanceByUserId = async ( userId ) => {

	const contractName = "LeaveBalance";
	const queryType = "queryByUserId";
	const result = await fabric.queryByIndex( contractName , queryType , userId );

	console.log(result);
	return result[0];

}

module.exports = LeaveBalanceService;