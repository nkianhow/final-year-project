'use strict';

const FabricCAServices = require('fabric-ca-client');
const { FileSystemWallet, Gateway, X509WalletMixin } = require('fabric-network');
const fs = require('fs');
const path = require('path');

const ccpPath = path.resolve(__dirname, '..', '..', 'hyperledger-fabric-network', 'connection-provider.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);

// consider storing informations here
// such as wallet, ca and etc.
function FabricService() {}

FabricService.prototype.enrollAdmin = async function(){

    const caUrl = 'ca.provider.example.com';

    try {

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities[ caUrl ];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (adminExists) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const adminObject = {
            enrollmentID: 'admin',
            enrollmentSecret: 'adminpw'
        } // both fields must match the values setted in config files

        const enrollment = await ca.enroll( adminObject );

        /**
         * 
         * @param {String} name of the membership provider (MSP)
         * @param {Object} enrollment certificate
         * @param {Byte} key of the certificate in byte form. 
         *
         * @return {Object} the identity of user 
         */
        const identity = X509WalletMixin.createIdentity('ProviderMSP', enrollment.certificate, enrollment.key.toBytes());

        // import generated identity into the wallet created in local file system
        await wallet.import('admin', identity);

    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

FabricService.prototype.registerUser = async function() {

    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userExists = await wallet.exists('user1');
        // if (userExists) {
        //     console.log('An identity for the user "user1" already exists in the wallet');
        //     return;
        // }

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists('admin');
        if (!adminExists) {
            console.log('An identity for the admin user "admin" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: 'admin', discovery: { enabled: true, asLocalhost: true } });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // const users = [ { enrollmentID : 'user1' , role : 'client '} , { enrollmentID : 'user2' , role : 'client '} , { enrollmentID : 'user3' , role : 'client '} ]

        // // Somehow, error are thrown here, FIX IT
        // for ( let i = 0 ; i < users.length ; i++ ) {
        //     let secret = await ca.register( users[i] , adminIdentity );
        //     let enrollment = await ca.enroll( { enrollmentID: users[i].enrollmentID , enrollmentSecret: secret } );
        //     let userIdentity = X509WalletMixin.createIdentity('ProviderMSP', enrollment.certificate, enrollment.key.toBytes());
        //     await wallet.import( users[i].enrollmentID , userIdentity );
        // }

        //Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({ enrollmentID: 'user1', role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: 'user1', enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity('ProviderMSP', enrollment.certificate, enrollment.key.toBytes());
        await wallet.import('user1', userIdentity);
        console.log('Successfully registered and enrolled admin user "user1" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "user1": ${error}`);
        process.exit(1);
    }
}

FabricService.prototype.queryAllPendingApplications = async function() {

    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        /**
         * Check to see if we've already enrolled the user.
         *
         * @param {String} username created/defined in the wallet
         */
        const userExists = await wallet.exists('user1');

        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet , identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        /**
         * Get the network (channel) our contract is deployed to.
         *
         * @param {String} name of network/channel
         */
        const network = await gateway.getNetwork('mychannel');


        /**
         * Get the contract instantiated in the network
         *
         * @param {String} name of the chaincode instantiated in the channel
         * @param {String} name of the contract instantiated in the channel
         */
        const contract = network.getContract('leave', 'LeaveApplication');

        /*
         * Evaluate the specified transaction
         * @param {String} name of the method within the specified contract
         *
         * @return {Buffer} results returned in buffer format
         */
        const result = await contract.evaluateTransaction('queryPendingApplications');

        const resultJSON = JSON.parse( result );

        return resultJSON;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

FabricService.prototype.updateLeaveApplicationStatus = async ( key , newStatus ) => {

     try {

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        const userIdentity = {
            wallet,
            identity : 'user1',
            discovery : {
                enabled : true,
                asLocalhost : true
            }
        };
        const gateway = new Gateway();
        await gateway.connect(ccpPath, userIdentity);

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('leave', 'LeaveApplication');

        await contract.submitTransaction('updateLeaveApplicationStatus', key , newStatus );

     }
     catch( error ){

        console.log(error);

     }
}

FabricService.prototype.createLeaveApplication = async ( username , key , name , department , startDate, endDate ) => {

    try { 

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        const userIdentity = {
            wallet,
            identity : 'user1',
            discovery : {
                enabled : true,
                asLocalhost : true
            }
        };
        const gateway = new Gateway();
        await gateway.connect(ccpPath, userIdentity);

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('leave', 'LeaveApplication');

        await contract.submitTransaction('createLeaveApplication', key , username , name , department , startDate, endDate);

    } catch( error ) {

        console.error( `Failed to submit transaction: ${error}` );

    }
}

FabricService.prototype.queryByIndex = async ( contractName , queryType , key ) => {

    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        /**
         * Check to see if we've already enrolled the user.
         *
         * @param {String} username created/defined in the wallet
         */
        const userExists = await wallet.exists('user1');

        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet , identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        /**
         * Get the network (channel) our contract is deployed to.
         *
         * @param {String} name of network/channel
         */
        const network = await gateway.getNetwork('mychannel');


        /**
         * Get the contract instantiated in the network
         *
         * @param {String} name of the chaincode instantiated in the channel
         * @param {String} name of the contract instantiated in the channel
         */
        const contract = network.getContract('leave', contractName );

        /*
         * Evaluate the specified transaction
         * @param {String} name of the method within the specified contract
         *
         * @return {Buffer} results returned in buffer format
         */
        const result = await contract.evaluateTransaction( queryType , key );

        const resultJSON = JSON.parse( result );

        return resultJSON;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

FabricService.prototype.queryAllUsers = async function() {

    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        /**
         * Check to see if we've already enrolled the user.
         *
         * @param {String} username created/defined in the wallet
         */
        const userExists = await wallet.exists('user1');

        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet , identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        /**
         * Get the network (channel) our contract is deployed to.
         *
         * @param {String} name of network/channel
         */
        const network = await gateway.getNetwork('mychannel');


        /**
         * Get the contract instantiated in the network
         *
         * @param {String} name of the chaincode instantiated in the channel
         * @param {String} name of the contract instantiated in the channel
         */
        const contract = network.getContract('leave', 'User');

        /*
         * Evaluate the specified transaction
         * @param {String} name of the method within the specified contract
         *
         * @return {Buffer} results returned in buffer format
         */
        const result = await contract.evaluateTransaction('queryAllUsers');

        const resultJSON = JSON.parse( result );

        return resultJSON;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

FabricService.prototype.generateForms = async ( key , name , department , position ) => {

    try { 

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        const userIdentity = {
            wallet,
            identity : 'user1',
            discovery : {
                enabled : true,
                asLocalhost : true
            }
        };
        const gateway = new Gateway();
        await gateway.connect(ccpPath, userIdentity);

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('leave', 'Appraisal');

        await contract.submitTransaction('createForm', key , name , department , position);

    } catch( error ) {

        console.error( `Failed to submit transaction: ${error}` );

    }
}

FabricService.prototype.query = async function( contractName , queryType ) {

    try {

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        /**
         * Check to see if we've already enrolled the user.
         *
         * @param {String} username created/defined in the wallet
         */
        const userExists = await wallet.exists('user1');

        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet , identity: 'user1', discovery: { enabled: true, asLocalhost: true } });
        /**
         * Get the network (channel) our contract is deployed to.
         *
         * @param {String} name of network/channel
         */
        const network = await gateway.getNetwork('mychannel');


        /**
         * Get the contract instantiated in the network
         *
         * @param {String} name of the chaincode instantiated in the channel
         * @param {String} name of the contract instantiated in the channel
         */
        const contract = network.getContract('leave', contractName );

        /*
         * Evaluate the specified transaction
         * @param {String} name of the method within the specified contract
         *
         * @return {Buffer} results returned in buffer format
         */
        const result = await contract.evaluateTransaction(queryType);

        const resultJSON = JSON.parse( result );

        return resultJSON;

    } catch (error) {
        console.error(`Failed to evaluate transaction: ${error}`);
        process.exit(1);
    }
}

FabricService.prototype.updateAppraisalForm = async function( key , comments , promotion ) {

     try { 

        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        const userExists = await wallet.exists('user1');
        if (!userExists) {
            console.log('An identity for the user "user1" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        const userIdentity = {
            wallet,
            identity : 'user1',
            discovery : {
                enabled : true,
                asLocalhost : true
            }
        };
        const gateway = new Gateway();
        await gateway.connect(ccpPath, userIdentity);

        const network = await gateway.getNetwork('mychannel');
        const contract = network.getContract('leave', 'Appraisal');

        await contract.submitTransaction('updateAppraisalForm', key , comments , promotion);

    } catch( error ) {

        console.error( `Failed to submit transaction: ${error}` );

    }
}

module.exports = FabricService;
