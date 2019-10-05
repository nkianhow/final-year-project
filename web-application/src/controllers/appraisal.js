'use strict'

const UserService = require('../services/user');
const AppraisalService = require('../services/appraisal');

const userService = new UserService();
const appraisalService = new AppraisalService();

function AppraisalController() {}

AppraisalController.prototype.generateForms = async ( req , res ) => {

	const employees = await userService.queryAllEmployees();
	const result = await appraisalService.generateForms(employees);

	res.redirect('/');
}

AppraisalController.prototype.submitAppraisal = async ( req , res ) => {

	const
		key = req.body.key,
		comments = req.body.comments,
		promotion = req.body.promoted;

	await appraisalService.submitAppraisal( key , comments , promotion );

	res.redirect('/appraisal');
}

AppraisalController.prototype.getEmployeeForm = async ( req , res ) => {

	const
		key = req.body.key,
		name = req.body.name,
		position = req.body.position,
		department = req.body.department;

	let employee = {
		key : key,
		name : name,
		position : position,
		department : department
	};

	res.render('appraisal-form' , { employee : employee } );

}

AppraisalController.prototype.queryAllEmployeesByDepartment = async ( req , res ) => {

	const department = req.user.department;

	const result = await appraisalService.queryByDepartment( department );

	res.render('appraisal' , { employees : result } );

}

AppraisalController.prototype.queryAllForms = async ( req , res ) => {
	
	const result = await appraisalService.queryAllForms();
	console.log(result);

}

module.exports = AppraisalController;