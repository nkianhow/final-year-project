'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();

function LeaveBalanceController() {}

/**
 * Query the list of all existing record of leave balance
 *
 */
LeaveBalanceController.prototype.queryAll = async ( req , res ) => {
	const contractName = 'LeaveBalance';
	const contractMethod = 'queryAllLeaveBalances';

	const result = await fabric.query(contractName, contractMethod);

	res.render('leave-balance', { leaveBalances: result } );
}

/**
 * Deduct the number of leaves taken by employee
 *
 */
LeaveBalanceController.prototype.deductLeaveBalance = async () => {

}

/**
 * Create new record of leave balance for new employee
 *
 */
LeaveBalanceController.prototype.createLeaveBalance = async () => {

}

module.exports = LeaveBalanceController;