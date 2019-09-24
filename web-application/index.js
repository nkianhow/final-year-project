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
	LeaveBalanceController = require('./src/controllers/leave-balance'),
	LeaveApplicationController = require('./src/controllers/leave-application');

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
	leaveBalanceController = new LeaveBalanceController(),
	leaveApplicationController = new LeaveApplicationController();

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

// define routes used in application
app.get( '/' , ( req , res ) => { res.render('login'); });

// failure should redirect to 404
app.post('/', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/'}) );

// assumingly working well routes
app.get('/leave/balance', leaveBalanceController.queryAll );
app.get('/leave/application', async ( req , res ) =>{ res.render('leave-application'); } );
app.post('/leave/application', leaveApplicationController.createLeaveApplication );
app.get('/leave/application/view', leaveApplicationController.queryAllPendingApplications );
app.post('/leave/application/update', leaveApplicationController.updateLeaveApplicationStatus );

app.listen( port , async () =>{
	// await fabric.enrollAdmin();
	// await fabric.registerUser();
	console.log( 'Server is up! Listening at port: ' + port ); 
});