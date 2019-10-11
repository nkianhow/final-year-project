'use strict';

const { Contract } = require('fabric-contract-api');

class BankAccount extends Contract {


    /**
     * Update bank account balance
     */
    async updateAccountBalance ( ctx , key , newBalance ){

        const bankAccountAsBytes = await ctx.stub.getState( key ); 
        if (!bankAccountAsBytes || bankAccountAsBytes.length === 0) {
            throw new Error(`${ key } does not exist`);
        }
        const bankAccount = JSON.parse(bankAccountAsBytes.toString());
        bankAccount.balance = newBalance;

        await ctx.stub.putState( key, Buffer.from( JSON.stringify(bankAccount) ) );

    }

    async queryByUserId( ctx , id ) {

        let queryString = {
            "selector": {
                "id": id,
                "docType" : "bankAccount"
            },
            "use_index": ["_design/indexUserIdDoc", "indexUserId"]
        }

        let queryResults = await this.queryWithQueryString( ctx, JSON.stringify(queryString) );
        return queryResults;

    }

        /**
     * Evaluate a queryString
     *
     * @param {Context} ctx the transaction context
     * @param {String} queryString the query string to be evaluated
     */    
    async queryWithQueryString(ctx, queryString) {

        console.log("query String");
        console.log(JSON.stringify(queryString));

        let resultsIterator = await ctx.stub.getQueryResult(queryString);
        
        let allResults = [];

        while (true) {
            let res = await resultsIterator.next();

            if (res.value && res.value.value.toString()) {
                let jsonRes = {};

                console.log(res.value.value.toString('utf8'));

                jsonRes.Key = res.value.key;

                try {
                    jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    jsonRes.Record = res.value.value.toString('utf8');
                }

                allResults.push(jsonRes);
            }
            if (res.done) {
                console.log('end of data');
                await resultsIterator.close();
                console.info(allResults);
                console.log(JSON.stringify(allResults));
                return JSON.stringify(allResults);
            }
        }

    }

}

module.exports.BankAccount = BankAccount;
