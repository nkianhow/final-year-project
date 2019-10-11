'use strict';

const LeaveBalance = require('./smart-contracts/leave').LeaveBalance;
const LeaveApplication = require('./smart-contracts/leave').LeaveApplication;
const User = require('./smart-contracts/user').User;
const Appraisal = require('./smart-contracts/appraisal').Appraisal;
const Claim = require('./smart-contracts/claim').Claim;
const BankAccount = require('./smart-contracts/bank-account').BankAccount;

module.exports.LeaveBalance = LeaveBalance;
module.exports.LeaveApplication = LeaveApplication;
module.exports.User = User;
module.exports.Appraisal = Appraisal;
module.exports.Claim = Claim;
module.exports.BankAccount = BankAccount;

module.exports.contracts = [ LeaveBalance , LeaveApplication, User , Appraisal , Claim , BankAccount ];