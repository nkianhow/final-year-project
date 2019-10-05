'use strict';

const LeaveBalance = require('./smart-contracts/leave').LeaveBalance;
const LeaveApplication = require('./smart-contracts/leave').LeaveApplication;
const User = require('./smart-contracts/user').User;
const Appraisal = require('./smart-contracts/appraisal').Appraisal;

module.exports.LeaveBalance = LeaveBalance;
module.exports.LeaveApplication = LeaveApplication;
module.exports.User = User;
module.exports.Appraisal = Appraisal;

module.exports.contracts = [ LeaveBalance , LeaveApplication, User , Appraisal ];