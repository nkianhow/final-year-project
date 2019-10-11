'use strict';

const { Contract } = require('fabric-contract-api');

class User extends Contract {

    async queryAllUsers( ctx ) {
        const startKey = 'USER0';
        const endKey = 'USER999';

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
     * Promote user
     * 
     * @param {String} newPosition user's promoted position
     */
    async promoteUser( ctx , userKey , newPosition ){

        const userAsBytes = await ctx.stub.getState( userKey ); 
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${ userKey } does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.position = newPosition;

        await ctx.stub.putState( userKey, Buffer.from( JSON.stringify(user) ) );

    } 

    /**
     * Update user's address
     *
     * @param {String} userKey user record's key
     * @param {String} newAddress user's new address
     */
    async updateAddress( ctx , userKey , newAddress ) {

        const userAsBytes = await ctx.stub.getState( userKey ); 
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${ userKey } does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.address = newAddress;

        await ctx.stub.putState( userKey, Buffer.from( JSON.stringify(user) ) );

    }

    /**
     * Update user's password
     *
     * @param {String} userKey user record's key
     * @param {String} newAddress user's new address
     */
    async updatePassword( ctx , userKey , newPassword ) {

        const userAsBytes = await ctx.stub.getState( userKey ); 
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`${ userKey } does not exist`);
        }
        const user = JSON.parse(userAsBytes.toString());
        user.password = newPassword;

        await ctx.stub.putState( userKey, Buffer.from( JSON.stringify(user) ) );

    }


    /**
     * Get user's information
     *
     * @param {String} username logged-in user's username
     * 
     * @return {Object} user's record
     */
    async queryByUsername( ctx , username ) {

        let queryString = {
            "selector": {
                "username": username,
                "docType" : "userInformation"
            },
            "use_index": ["_design/indexUsernameDoc", "indexUsername"]
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


module.exports.User = User;