'use strict'

const LeaveApplicationService = require('../services/leave-application');
const LeaveBalanceService = require('../services/leave-balance');

const leaveApplicationService = new LeaveApplicationService();
const leaveBalanceService = new LeaveBalanceService();

function LeaveController() {}

/**
 * Query leave application status by employee
 */
LeaveController.prototype.queryApplicationByUsername = async ( req , res ) => {

	const username = req.user.username;
	const userApplications = await leaveApplicationService.queryByUsername( username );
	console.log(userApplications);

	res.render('view-leave-application', { leaveApplications : userApplications });
}

/**
 * Query reviewed leave applications from department
 */
LeaveController.prototype.queryReviewedApplicationsByDepartment = async ( req , res ) => {

	const department = req.user.department;
	const userApplications = await leaveApplicationService.queryReviewedApplicationsByDepartment( department );

	res.render('view-leave-application' , { leaveApplications : userApplications });
}

/**
 * Query pending leave applications of all employees
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

	const 
		userCtx = req.user,
		applicationCtx = req.body;

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
		currentStatus = req.body.status;

	if( approval == 'reject') {
		await leaveApplicationService.rejectLeaveApplication( key );
	} else {
		if ( currentStatus == 'PENDING' ){
			await leaveApplicationService.reviewLeaveApplication( key );
		} else {
			await leaveApplicationService.approveLeaveApplication( key );
			// await leaveBalanceService.deductLeaveBalance();
		}
	}
	
	res.redirect('/');
}

/**
 * Query leave balances of all employees
 *
 */
LeaveController.prototype.queryAllLeaveBalances = async ( req , res ) => {

	const result = await leaveBalanceService.queryAllLeaveBalances();

	res.render('leave-balance' , { leaveBalances : result } );

}

module.exports = LeaveController;