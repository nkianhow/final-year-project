'use strict'

const FabricService = require('../../fabric/service');
const fabric = new FabricService();
const _ = require('lodash');

function BankService() {}

BankService.prototype.queryUserBankAccount = async ( id ) => {

	const contractName = "BankAccount";
	const queryType = "queryByUserId";
	const result = await fabric.queryByIndex( contractName , queryType , id );

	return result[0];
}

BankService.prototype.queryManyBankAccounts = async ( approvedClaims ) => {

	const contractName = "BankAccount";
	const queryType = "queryByUserId";
	const bankAccounts = [];


	for (const claim of approvedClaims) {
	    const result = await fabric.queryByIndex( contractName , queryType , claim.Record.id);
	    bankAccounts.push(result[0]);
  	}

  	const result = _.uniqBy(bankAccounts , 'Key');

	return result;
}

/**
 * Reimburse claims to users
 *
 * @param {Array} approvedClaims list of claims to reimburse
 * @param {Array} bankAccounts list of banks accounts to reimburse
 */
BankService.prototype.updateBankAccountsBalance = async ( approvedClaims , bankAccounts ) => {


	for (const account of bankAccounts ) {

		let reimburseSum = 0.0;

		for ( const claim of approvedClaims ) {

			if( account.Record.id ===  claim.Record.id ) {

				reimburseSum += parseFloat( claim.Record.claimAmount );
			}

		}

		let originalBalance = parseFloat( account.Record.balance ) ;
		let newBalance = ( originalBalance + reimburseSum ).toString()

		await fabric.updateAccountBalance( account.Key , newBalance );
	} 

	// bankAccounts.forEach( async function( bankAccount ) { 

	// 	let key = bankAccount.Key;
	// 	let reimburseSum = 0.0;
	// 	let originalBalance = parseFloat(bankAccount.balance);

	// 	await approvedClaims.forEach( async function ( claim ) {

	// 		if( bankAccount.id === claim.id ) {

	// 			reimburseSum += parseFloat( claim.claimAmount );

	// 		}
	// 	});

	// 	let newBalance = reimburseSum + originalBalance;

	// 	// await fabric.updateAccountBalance( key , newBalance.toString() );
	// });
}

module.exports = BankService;