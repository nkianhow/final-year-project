'use strict'

// Load app modules
const
	port 	= 3000,
	express	= require('express'),
	app		= express(),
	bodyParser	= require('body-parser'),
	passport	= require('passport'),
	LocalStrategy = require('passport-local'),
	expressSession	= require('express-session');

// Load services and controllers
const
	Fabric = require('./fabric/service'),
	AuthenticationController = require('./src/controllers/authentication'),
	LeaveController = require('./src/controllers/leave'),
	AppraisalController = require('./src/controllers/appraisal'),
	ClaimController = require('./src/controllers/claim'),
	UserController = require('./src/controllers/user');

// define session configuration 
const sessionConfig = {
	secret: 'secret',
	resave: false,
	saveUninitialized: false
}

// Instantiation of services and controllers
const 
	fabric = new Fabric(),
	authenticationController = new AuthenticationController(),
	leaveController = new LeaveController(),
	appraisalController = new AppraisalController(),
	claimController = new ClaimController(),
	userController = new UserController();

// define configuration used in application
app.set( 'view engine' , 'ejs' );
app.use( bodyParser.urlencoded( { extended : true } ) );
app.use( bodyParser.json() );
app.use(expressSession( sessionConfig ));
app.use( passport.initialize() );
app.use( passport.session() );
passport.use( authenticationController.strategy() );
passport.serializeUser( authenticationController.serialize );
passport.deserializeUser( authenticationController.deserialize );

/**
 * Middlewares
 */
app.use(function(req, res, next){
	res.locals.user = req.user;
	next();
})

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/login');
}

// define routes used in application
app.get( '/login' , ( req , res ) => { res.render('login'); });

// failure should redirect to 404
app.post('/login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/'}) );
app.get('/logout', ( req, res ) => { req.logout(); res.redirect('/login'); });

// assumingly working well routes
app.get('/', isLoggedIn, ( req , res ) => { res.render('landing-page'); } );
app.get('/leave/balance', leaveController.queryAllPendingApplications );
app.get('/leave/apply', leaveController.queryLeaveBalanceByUserId );
app.post('/leave/apply', leaveController.createLeaveApplication );
app.get('/leave/view', leaveController.queryLeaveApplicationByUserId );
app.get('/leave/pending', leaveController.queryAllPendingApplications );
app.get('/leave/reviewed', leaveController.queryReviewedApplicationsByDepartment );
app.post('/leave/update',leaveController.updateLeaveApplicationStatus );

app.get('/appraisal', appraisalController.queryAllEmployeesByDepartment );
app.post('/appraisal', appraisalController.submitAppraisal ); 
app.get('/appraisal/reports', appraisalController.queryAllForms );
app.get('/appraisal/reports/department', appraisalController.queryReportsByDepartment );
app.post('/appraisal/form', appraisalController.getEmployeeForm );
app.get('/appraisal/generate', appraisalController.generateForms );

app.get('/claim/form', ( req , res ) => { res.render('claim-form'); });
app.post('/claim/submit', claimController.submitClaim );
app.get('/claim/user', claimController.queryUserClaim );
app.get('/claim', claimController.queryPendingClaims );
app.post('/claim/update', claimController.updateClaimStatus );
app.get('/claim/reimbursement' , claimController.reimburseClaims );

app.get('/user', userController.queryUserInformation );
app.post('/user/address' , userController.updateAddress );
app.get('/user/password', userController.queryUserAccountInformation );
app.post('/user/password', userController.updatePassword );
app.get('/user/bank', userController.queryUserBankAccount );

app.listen( port , async () =>{
	// await fabric.enrollAdmin();
	// await fabric.registerUser();
	console.log( 'Server is up! Listening at port: ' + port ); 
});