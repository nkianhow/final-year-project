'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();

function LeaveApplicationService() {}
LeaveApplicationService.prototype.key = 0;

/**
 * Query leave applications belonging to specified user
 * 
 * @params {String} username 
 *
 * @return {Object[]} array of leave applications
 */
LeaveApplicationService.prototype.queryByUsername = async ( username ) => {

	const queryType = "queryByUsername";
	const key = username;

	const result = await fabric.queryByIndex( queryType , key );

	return result;
}

/**
 * Query leave applications from a specified department
 *
 */
LeaveApplicationService.prototype.queryReviewedApplicationsByDepartment = async ( department ) => {

	const queryType = "queryReviewedApplications";
	const key = department;

	const result = await fabric.queryByIndex( queryType , key );

	return result;
}

/**
 * Query all leave applications in the ledger
 *
 * @return {Object[]} array of leave applications
 */
LeaveApplicationService.prototype.queryAllPendingApplications = async () => {	

	const result = await fabric.queryAllPendingApplications();

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