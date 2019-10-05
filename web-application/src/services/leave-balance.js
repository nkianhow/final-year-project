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
LeaveBalanceService.prototype.deductLeaveBalance = async () => {

}

/**
 * Create new record of leave balance for new employee
 *
 */
LeaveBalanceService.prototype.createLeaveBalance = async () => {

}

module.exports = LeaveBalanceService;