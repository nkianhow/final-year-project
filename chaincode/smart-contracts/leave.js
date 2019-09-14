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

    async initLedger( ctx ) {

        // insert sample leave application into ledger
        const leaveApplication = {
            empName: 'Jason',
            startDate: new Date(),
            endDate: new Date(),
            docType: 'Leave Application',
            status: 'Pending'
        }

        // define key type and index
        const index = 1;
        const type = 'LEAVEAPPLICATION';

        await ctx.stub.putState( type + index, Buffer.from(JSON.stringify(leaveApplication)) );

    }

    /*
     * Creating a leave application submitted by an employee
     * status should be defaulted to 'PENDING', awaiting approval from HR then direct superior
     *
     * @param {String} key of the record
     * @param {String} name of employee
     * @param {Date} start date of leave
     * @param {Date} end date of leave
     * @param {String} status of the application
     */
    async createLeaveApplication( ctx, key, empName, startDate, endDate, status ) {

        const leaveApplication = {
            empName,
            startDate,
            endDate,
            docType: 'Leave Application',
            status
        }

        await ctx.stub.putState( key, Buffer.from(JSON.stringify(leaveApplication)) );
    }

    async updateLeaveApplicationStatus( ctx, empName, newStatus ) {
        
    }

    async queryAllLeaveApplications(ctx) {
        const startKey = 'LEAVEAPPLICATION1';
        const endKey = 'LEAVEAPPLICATION999';

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
}

module.exports.LeaveBalance = LeaveBalance;
module.exports.LeaveApplication = LeaveApplication;
