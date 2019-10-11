'use strict'

const ClaimService = require('../services/claim');
const BankService = require('../services/bank');

const claimService = new ClaimService();
const bankService = new BankService();

function ClaimController() {}

ClaimController.prototype.submitClaim = async ( req , res ) => {

	const
		id = req.user.id,
		name = req.user.name,
		department = req.user.department;

	const 
		claimType = req.body.claimType,
		claimAmount = req.body.claimAmount;

	await claimService.submitClaim( id , name , department , claimType, claimAmount ); 

	 res.redirect('/');
}

ClaimController.prototype.queryPendingClaims = async ( req , res ) => {

	const status = 'PENDING';
	const pendingClaims = await claimService.queryClaimsByStatus( status );

	res.render('claim', { claims : pendingClaims });
}

ClaimController.prototype.reimburseClaims = async ( req , res ) => {

	const status = 'APPROVED';
	const approvedClaims = await claimService.queryClaimsByStatus( status );
	
	const bankAccounts = await bankService.queryManyBankAccounts( approvedClaims );
	await bankService.updateBankAccountsBalance( approvedClaims , bankAccounts );
	await claimService.updateMultipleClaimsStatus( approvedClaims );

	res.redirect('/');
}

ClaimController.prototype.updateClaimStatus = async ( req , res ) => {

	const
		key = req.body.key,
		newStatus = req.body.newStatus;

	console.log(newStatus);

	await claimService.updateClaimStatus( key , newStatus );

	res.redirect('/claim');
}

ClaimController.prototype.queryUserClaim = async ( req , res ) => {

	const
		userId = req.user.id;

	const userClaims = await claimService.queryUserClaims( userId );

	res.render('claim-user' , { claims : userClaims });
}

// ClaimController.prototype.queryAllClaims = async ( req , res ) => {

// 	const claims = await claimService.queryAllClaims();

// 	console.log(claims);

// 	res.render('claim' , { claims : claims });
// }

module.exports = ClaimController;