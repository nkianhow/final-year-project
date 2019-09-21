'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();

function LeaveApplicationController() {}

LeaveApplicationController.prototype.query = function() {

}

LeaveApplicationController.prototype.queryAll = async ( req , res ) => {
	
	const contractName = 'LeaveApplication';
	const contractMethod = 'queryAllLeaveApplications';
	const result = await fabric.query( contractName , contractMethod );

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

	const startDate = req.body.startDate;
	const endDate = req.body.endDate;

	const username = "Jason";

	await fabric.createLeaveApplication( username, startDate, endDate );

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