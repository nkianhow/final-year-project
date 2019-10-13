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
LeaveApplicationService.prototype.queryLeaveApplicationByUserId = async ( userId ) => {

	const contractName = "LeaveApplication";
	const queryType = "queryByUserId";
	const key = userId;

	const result = await fabric.queryByIndex( contractName, queryType , key );

	return result;
}

/**
 * Query leave applications from a specified department
 *
 */
LeaveApplicationService.prototype.queryReviewedApplicationsByDepartment = async ( department ) => {

	const contractName = "LeaveApplication";
	const queryType = "queryReviewedApplications";
	const key = department;

	const result = await fabric.queryByIndex( contractName , queryType , key );

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

	const key = LeaveApplicationService.prototype.key.toString();
	const startDate = applicationCtx.startDate;
	const endDate = applicationCtx.endDate;
	const noOfDays = applicationCtx.noOfDays;
	const id = userCtx.id;
	const department = userCtx.department;
	const name = userCtx.name;

	console.log(key + ' ' + id + ' ' + name + ' ' + department + ' ' + startDate + ' ' + endDate + ' ' + noOfDays );
	
	await fabric.createLeaveApplication( key , id , name , department , startDate , endDate , noOfDays );
	LeaveApplicationService.prototype.key++;
	
}

LeaveApplicationService.prototype.updateLeaveApplicationStatus = async ( key , newStatus ) => {

	await fabric.updateLeaveApplicationStatus( key , newStatus );
}





module.exports = LeaveApplicationService;