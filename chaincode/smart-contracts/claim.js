'use strict';

const { Contract } = require('fabric-contract-api');

class Claim extends Contract {

    async createClaim( ctx , key , id , name , department , claimType , claimAmount ) {
            
        let claim = {
            id, 
            name,
            department,
            docType: "claim",
            claimType : claimType,
            claimAmount : claimAmount,
            status: "PENDING",
        }

        await ctx.stub.putState('CLAIM' + key, Buffer.from(JSON.stringify(claim)));
    }

    /**
     *  Query claims by status
     */
    async queryByStatus( ctx , status ) {

        let queryString = {
            "selector": {
                "status": status,
                "docType" : "claim"
            },
            "use_index": ["_design/indexClaimStatusDoc", "indexClaimStatus"]
        }

        let queryResults = await this.queryWithQueryString( ctx, JSON.stringify(queryString) );
        return queryResults;

    }

    /**
     *  Query claims by status
     */
    async queryByUserId( ctx , id ) {

        let queryString = {
            "selector": {
                "id": id,
                "docType" : "claim"
            },
            "use_index": ["_design/indexUserIdDoc", "indexUserId"]
        }

        let queryResults = await this.queryWithQueryString( ctx, JSON.stringify(queryString) );
        return queryResults;

    }

    async updateClaimStatus( ctx, claimKey , newStatus ) {

        const claimAsBytes = await ctx.stub.getState( claimKey ); 
        if (!claimAsBytes || claimAsBytes.length === 0) {
            throw new Error(`${ claimKey } does not exist`);
        }
        const claim = JSON.parse(claimAsBytes.toString());
        claim.status = newStatus;

        await ctx.stub.putState( claimKey, Buffer.from( JSON.stringify(claim) ) );
    }

    async queryAllClaims( ctx ) {
        const startKey = 'CLAIM0';
        const endKey = 'CLAIM999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            const res = await iterator.next();

            if (res.value && res.value.value.toString()) {
                console.log(res.value.value.toString('utf8'));

                const Key = res.value.key;
                let Record;
                try {
                    Record = JSON.parse(res.value.value.toString('utf8'));
                } catch (err) {
                    console.log(err);
                    Record = res.value.value.toString('utf8');
                }
                allResults.push({ Key, Record });
            }
            if (res.done) {
                console.log('end of data');
                await iterator.close();
                console.info(allResults);
                return JSON.stringify(allResults);
            }
        }
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

module.exports.Claim = Claim;
