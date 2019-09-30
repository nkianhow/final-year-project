'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();

function LeaveApplicationController() {}

LeaveApplicationController.prototype.key = 0;
/**
 * Query leave applications belonging to specified user
 * 
 * @param {String} username 
 */
LeaveApplicationController.prototype.queryByUsername = async ( req , res ) => {

	const username = req.body.username; 

	const result = await fabric.queryByUsername( username );

	console.log(result);
}

/**
 * Query leave applications from a specified department
 *
 */
LeaveApplicationController.prototype.queryByDepartment = async ( req , res ) => {

	const department = req.body.department;
	const position = req.body.position;

	if( position != 'HOD' ) {
		// throw some error messages
	} else {
		const result = await fabric.queryByDepartment( department );
		console.log(result);
	}
}

/**
 * Query all leave applications in the ledger
 *
 * @return {Object[]} array of leave application 
 */
LeaveApplicationController.prototype.queryAllPendingApplications = async ( req , res ) => {
	
	// It might be logical to return the applications that requires review
	const contractName = 'LeaveApplication';
	const contractMethod = 'queryAllLeaveApplications';
	const result = await fabric.query( contractName , contractMethod );
	console.log(result);

	res.render('view-leave-application', { leaveApplications : result });
}

/**
 * Creation of leave application
 *
 * @param {Object} request.body - form data
 * @param {Date} request.body.startDate - Start date of leave
 * @param {Date} request.body.endDate - End date of leave
 */
LeaveApplicationController.prototype.createLeaveApplication = async function( req , res ) {

	const ctx = req.body;
	const userCtx = req.user;

	console.log(req.user);
	
	const startDate = ctx.startDate;
	const endDate = ctx.endDate;
	const username = userCtx.username;
	const department = userCtx.department;
	const name = userCtx.name;
	const key = LeaveApplicationController.prototype.key.toString();

	await fabric.createLeaveApplication( username , key , name , department , startDate , endDate );
	LeaveApplicationController.prototype.key++;

	res.redirect('/leave/application');
}

/**
 * Approval of leave application
 *
 * @param {Object} request.body - form data
 * @param {String} request.body.approval - approval of the leave application
 * @param {String} request.body.key - key of the leave application
 * @param {String} request.body.status - current status of leave application
 */
LeaveApplicationController.prototype.updateLeaveApplicationStatus = async ( req , res ) => {

	const 
		key = req.body.key,
		approval = req.body.approval,
		currentStatus = req.body.status;

	let newStatus = 'REJECTED';

	if( approval == 'approve' ) {
		if( currentStatus == 'PENDING' ) {
			newStatus = 'REVIEWED';
		} else {
			newStatus = 'APPROVED';
		}
	}

	await fabric.updateLeaveApplicationStatus( key , newStatus );
	res.redirect('/leave/application/view');
}

module.exports = LeaveApplicationController;