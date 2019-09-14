'use strict';

const LeaveBalance = require('./smart-contracts/leave').LeaveBalance;
const LeaveApplication = require('./smart-contracts/leave').LeaveApplication;

module.exports.LeaveBalance = LeaveBalance;
module.exports.LeaveApplication = LeaveApplication;

module.exports.contracts = [ LeaveBalance , LeaveApplication];
