'use strict'

const LeaveApplicationService = require('../services/leave-application');
const leaveApplicationService = new LeaveApplicationService();

function LeaveController() {}

/**
 * Get all pending leave applications
 *
 */
LeaveController.prototype.queryAllPendingApplications = async ( req , res ) => {

	const applications = await leaveApplicationService.queryAllPendingApplications();

	res.render('view-leave-application', { leaveApplications : applications });
}

/**
 * Description
 *
 * @params {Object} req.user logged-in user information
 * @params {Object} req.body context of application
 */
LeaveController.prototype.createLeaveApplication = async ( req , res ) => {

	const userCtx = req.user;
	const applicationCtx = req.body;

	await leaveApplicationService.createLeaveApplication( userCtx , applicationCtx );

	res.redirect('/');

}

/**
 * Description
 *
 * @params {Object} req.body context of approval
 * @params {String} req.body.key 
 * @params {String} req.body.approval
 * @params {String} req.body.currentStatus 
 */
LeaveController.prototype.updateLeaveApplicationStatus = async ( req , res ) => {

	const
		key = req.body.key,
		approval = req.body.approval,
		currentStatus = req.body.currentStatus;

	if( approval == 'reject') {
		await leaveApplicationService.rejectLeaveApplication( key );
	} else {
		if ( currentStatus == 'PENDING' ){
			await leaveApplicationSerice.reviewLeaveApplication( key );
		} else {
			await leaveApplicationService.approveLeaveApplication( key );
			// await leaveBalanceService.deductLeaveBalance();
		}
	}
	
	res.redirect('/');
}

module.exports = LeaveController;