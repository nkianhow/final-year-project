'use strict';

const { Contract } = require('fabric-contract-api');

class LeaveBalance extends Contract {

    async initLedger(ctx) {

        const leaves = [
            {
                name: 'jason',
                annualLeave: 14,
                medicalLeave: 14
            },
            {
                name: 'jane',
                annualLeave: 14,
                medicalLeave: 14
            },
            {
                name: 'jones',
                annualLeave: 14,
                medicalLeave: 14
            },
        ];

        for (let i = 0; i < leaves.length; i++) {
            leaves[i].docType = 'leaveBalance';
            await ctx.stub.putState('LEAVE' + i, Buffer.from(JSON.stringify(leaves[i])));
        }

    }

    async queryLeave(ctx, leaveNumber) {
        const leaveAsBytes = await ctx.stub.getState(leaveNumber);

        if (!leaveAsBytes || leaveAsBytes.length === 0) {
            throw new Error(`${leaveNumber} does not exist`);
        }

        console.log(leaveAsBytes.toString());
        return leaveAsBytes.toString();
    }

    async queryAllLeaveBalances(ctx) {
        const startKey = 'LEAVE0';
        const endKey = 'LEAVE999';

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
     * Creation of record for new employee
     *
     * @param {String} name of employee
     * @param {Number} number of annual leaves allocated
     * @param {Number} number of medical leaves allocated
     */
    async createLeaveBalance( ctx, empName, numOfAL, numOfML ) {

        /*
         * ASSIGNMENT OF KEY MIGHT REQUIRE ADDITIONAL CONSIDERATION
         *  1. STATIC KEY
         *  2. SEQUENTIAL KEY
         */
        const key = 'LEAVE' + '1';

        const leaveBalance = {
            empName,
            numOfAL,
            numOfML
        };

        await ctx.stub.putState( key , Buffer.from(JSON.stringify(leaveBalance)) );

    }

    /**
     * Deduction of employee leave/medical leaves balance
     *
     * @param {String} key of employee's record
     * @param {String} type of leave, medical/annual
     * @param {Number} number of leave taken
     */
    async deductLeaveBalance( ctx, key, leaveType, deductible ) {

        const leaveBalanceAsBytes = await ctx.stub.getState( key );
        if( !leaveBalanceAsBytes || leaveBalanceAsBytes === 0 ) {
            throw new Error(`${ key } does not exist`);
        }
        const leaveBalance = JSON.parse( leaveBalanceAsBytes.toString() );

        if( leaveType === "medicalLeave" ) {
            leaveBalance.medicalLeave = leaveBalance.medicalLeave - deductible;
        } else if( leaveType === "annualLeave" ){
            leaveBalance.annualLeave = leaveBalance.annualLeave - deductible;
        } else {
            throw new Error("Invalid leave's type");
        }

        await ctx.stub.putState( key , Buffer.from(JSON.stringify(leaveBalance)) );

        console.info('============= END : Deducted Employee Leave Balance ===========');
    }

}

class LeaveApplication extends Contract {

    async initLedger( ctx ) { }

    /*
     * Creating a leave application submitted by an employee
     * All new application has default status of 'PENDING'
     *
     * @param {String} key of the record
     * @param {String} name of employee
     * @param {Date} start date of leave
     * @param {Date} end date of leave
     * @param {String} status of the application
     */
    async createLeaveApplication( ctx , key , username , name , department , startDate , endDate  ) {

        const leaveApplication = {
            username,
            name,
            department,
            startDate,
            endDate,
            docType: 'Leave Application',
            status: 'PENDING'
        }

        await ctx.stub.putState( 'LEAVEAPPLICATION' + key , Buffer.from(JSON.stringify(leaveApplication)) );
    }

    /**
     * Updating the status of leave application
     *
     * @param {String} key of the record
     * @param {String} new status: 'REJECTED', 'REVIEWED', 'APPROVED'
     */
    async updateLeaveApplicationStatus( ctx, leaveApplicationKey , newStatus ) {

        const leaveApplicationAsBytes = await ctx.stub.getState( leaveApplicationKey ); 
        if (!leaveApplicationAsBytes || leaveApplicationAsBytes.length === 0) {
            throw new Error(`${ leaveApplicationKey } does not exist`);
        }
        const leaveApplication = JSON.parse(leaveApplicationAsBytes.toString());
        leaveApplication.status = newStatus;

        await ctx.stub.putState( leaveApplicationKey, Buffer.from( JSON.stringify(leaveApplication) ) );
    }

    async queryAllLeaveApplications( ctx ) {

        const startKey = 'LEAVEAPPLICATION0';
        const endKey = 'LEAVEAPPLICATION999';

        const iterator = await ctx.stub.getStateByRange(startKey, endKey);

        const allResults = [];
        while (true) {
            console.log(allResults);
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
     * Query by employee
     *
     * @param {Context} ctx the transaction context
     * @param {String} username the username of current user
     */
    async queryByUsername( ctx , username ) {

        let queryString = {
            "selector": {
                "empName": username
            },
            "use_index": ["_design/index1Doc", "index1"]
        }

        let queryResults = await this.queryWithQueryString(ctx, JSON.stringify(queryString));
        return queryResults;

    }

    /**
     * Query by department
     *
     * @param {Context} ctx the transaction context
     * @param {String} department the department that it belongs
    */
    async queryByDepartment( ctx , department ) {

        let queryString = {
            "selector": {
                "department": department
            },
            "use_index": ["_design/index1Doc", "index1"]
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

module.exports.LeaveBalance = LeaveBalance;
module.exports.LeaveApplication = LeaveApplication;
