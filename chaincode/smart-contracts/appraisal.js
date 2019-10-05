'use strict';

const { Contract } = require('fabric-contract-api');

class Appraisal extends Contract {

    async createForm( ctx , key , name , department , position ) {
            
        let appraisalForm = {
            name,
            department,
            position,
            docType: "Appraisal Form",
            status: "PENDING",
            comments: "",
            promotion: "nil"
        }

        await ctx.stub.putState('APPRAISAL' + key, Buffer.from(JSON.stringify(appraisalForm)));
    }

    async updateAppraisalForm( ctx, appraisalFormKey , comments , promotion ) {

        const appraisalFormAsBytes = await ctx.stub.getState( appraisalFormKey ); 
        if (!appraisalFormAsBytes || appraisalFormAsBytes.length === 0) {
            throw new Error(`${ appraisalFormKey } does not exist`);
        }
        const appraisalForm = JSON.parse(appraisalFormAsBytes.toString());
        appraisalForm.status = 'COMPLETED';
        appraisalForm.comments = comments;
        appraisalForm.promotion = promotion;

        await ctx.stub.putState( appraisalFormKey, Buffer.from( JSON.stringify(appraisalForm) ) );
    }

    async queryAllForms( ctx ) {
        const startKey = 'APPRAISAL0';
        const endKey = 'APPRAISAL999';

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

    async queryByDepartment( ctx , department ){

        let queryString = {
            "selector": {
                "department": department,
                "docType" : "Appraisal Form"
            },
            "use_index": ["_design/indexUserDepartmentDoc", "indexUserDepartment"]
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
    async queryWithQueryString( ctx, queryString ) {

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

module.exports.Appraisal = Appraisal;
