'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();

function AppraisalService() {}
AppraisalService.prototype.key = 0;

AppraisalService.prototype.generateForms = async ( employees ) => {

	for( let i = 0; i< employees.length; i++) {
		let name = employees[i].name;
		let	department = employees[i].department;
		let position = employees[i].position;

		await fabric.generateForms( AppraisalService.prototype.key.toString() , name , department , position );
		AppraisalService.prototype.key++;
	}

}

AppraisalService.prototype.queryByDepartment = async ( department ) => {

	const contractName = "Appraisal";
	const queryType = "queryByDepartment";

	const result = await fabric.queryByIndex( contractName , queryType , department );

	return result;
}

AppraisalService.prototype.queryAllForms = async () => {

	const contractName = "Appraisal";
	const queryType = "queryAllForms";

	const result = await fabric.query( contractName , queryType );

	return result;
}

AppraisalService.prototype.submitAppraisal = async ( key , comments , promotion ) => {

	await fabric.updateAppraisalForm( key , comments , promotion );
}

module.exports = AppraisalService;