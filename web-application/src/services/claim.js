'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();

function ClaimService() {}
ClaimService.prototype.key = 0;

ClaimService.prototype.submitClaim = async ( id , name , department , claimType , claimAmount ) => {

	await fabric.submitClaim( ClaimService.prototype.key.toString() , id,  name , department , claimType , claimAmount );
	ClaimService.prototype.key++;

}


ClaimService.prototype.queryClaimsByStatus = async ( status ) => {

	const contractName = "Claim"
	const queryType = "queryByStatus";
	const result = await fabric.queryByIndex( contractName , queryType ,  status );

	return result;
}

ClaimService.prototype.updateClaimStatus = async ( key , newStatus ) => {

	await fabric.updateClaimStatus( key , newStatus ); 
	
}

ClaimService.prototype.queryUserClaims = async ( id ) => {

	const contractName = "Claim";
	const queryType = "queryByUserId";
	const result = await fabric.queryByIndex( contractName , queryType , id );

	return result;
}

ClaimService.prototype.updateMultipleClaimsStatus = async ( claims ) => {

	for (const claim of claims) {

	    await fabric.updateClaimStatus( claim.Key , 'COMPLETED' );

  	}
}
// ClaimService.prototype.queryAllClaims = async () => {

// 	const result = await fabric.queryAllClaims();

// 	return result;
// }
module.exports = ClaimService;