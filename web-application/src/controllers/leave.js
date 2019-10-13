'use strict'

const LeaveApplicationService = require('../services/leave-application');
const LeaveBalanceService = require('../services/leave-balance');

const leaveApplicationService = new LeaveApplicationService();
const leaveBalanceService = new LeaveBalanceService();

function LeaveController() {}

/**
 * Query leave application status by employee
 */
LeaveController.prototype.queryLeaveApplicationByUserId = async ( req , res ) => {

	const id = req.user.id;
	const userApplications = await leaveApplicationService.queryLeaveApplicationByUserId( id );

	res.render('leave-application-user', { leaveApplications : userApplications });
}

/**
 * Query reviewed leave applications from department
 */
LeaveController.prototype.queryReviewedApplicationsByDepartment = async ( req , res ) => {

	const department = req.user.department;
	const userApplications = await leaveApplicationService.queryReviewedApplicationsByDepartment( department );

	res.render('leave-application' , { leaveApplications : userApplications });
}

/**
 * Query pending leave applications of all employees
 *
 */
LeaveController.prototype.queryAllPendingApplications = async ( req , res ) => {

	const applications = await leaveApplicationService.queryAllPendingApplications();

	res.render('leave-application', { leaveApplications : applications });
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
		id = req.body.id,
		approval = req.body.approval,
		currentStatus = req.body.status;

	if( approval == 'reject') {
		await leaveApplicationService.updateLeaveApplicationStatus( key , 'REJECTED');
	} else {
		if ( currentStatus == 'PENDING' ){
			await leaveApplicationService.updateLeaveApplicationStatus( key , 'REVIEWED');
		} else {
			await leaveApplicationService.updateLeaveApplicationStatus( key , 'APPROVED');
			const leaveBalance = await leaveBalanceService.queryLeaveBalanceByUserId( id );
			const noOfDays = req.body.noOfDays;
			await leaveBalanceService.deductLeaveBalance( leaveBalance , noOfDays );
		}
	}
	
	res.redirect('/');
}

LeaveController.prototype.queryLeaveBalanceByUserId = async ( req , res ) => {

	const leaveBalance = await leaveBalanceService.queryLeaveBalanceByUserId( req.user.id );

	res.render('leave-form' , { leaveBalance : leaveBalance });
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