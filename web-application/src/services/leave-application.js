'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();

function LeaveApplicationService() {}
LeaveApplicationService.prototype.key = 0;

/**
 * Query leave applications belonging to specified user
 * 
 * @param {String} username 
 */
LeaveApplicationService.prototype.queryByUsername = async ( req , res ) => {

	const username = req.body.username; 

	const result = await fabric.queryByUsername( username );

	console.log(result);
}

/**
 * Query leave applications from a specified department
 *
 */
LeaveApplicationService.prototype.queryByDepartment = async ( req , res ) => {

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
LeaveApplicationService.prototype.queryAllPendingApplications = async () => {
	
	const contractName = 'LeaveApplication';
	const contractMethod = 'queryAllLeaveApplications';

	const result = await fabric.query( contractName , contractMethod );

	return result;
}

/**
 * Creation of leave application
 *
 * @param {Object} userCtx - logged-in user information
 * @param {Object} applicationCtx - dates for leave
 */
LeaveApplicationService.prototype.createLeaveApplication = async ( userCtx , applicationCtx ) => {

	const startDate = applicationCtx.startDate;
	const endDate = applicationCtx.endDate;
	const username = userCtx.username;
	const department = userCtx.department;
	const name = userCtx.name;
	const key = LeaveApplicationService.prototype.key.toString();

	await fabric.createLeaveApplication( username , key , name , department , startDate , endDate );
	LeaveApplicationService.prototype.key++;
	
}


LeaveApplicationService.prototype.reviewLeaveApplication = async ( key ) => {

	await fabric.updateLeaveApplicationStatus( key , 'REVIEWED' );

}

LeaveApplicationService.prototype.approveLeaveApplication = async ( key ) => {

	await fabric.updateLeaveApplicationStatus( key , 'APPROVED' );
}

LeaveApplicationService.prototype.rejectLeaveApplication = async ( key ) => {

	await fabric.updateLeaveApplicationStatus( key , 'REJECTED' ); 
}





module.exports = LeaveApplicationService;