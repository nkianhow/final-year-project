'use strict'

// Load app modules
const
	port 	= 3000,
	express	= require('express'),
	app		= express(),
	bodyParser	= require('body-parser'),
	passport	= require('passport-local'),
	LocalStrategy	= require('passport-local'),
	expressSession	= require('express-session');

// Load services and controllers
const
	Fabric = require('./fabric/service'),
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
	leaveBalanceController = new LeaveBalanceController(),
	leaveApplicationController = new LeaveApplicationController();

// define configuration used in application
app.set( 'view engine' , 'ejs' );
app.use( bodyParser.urlencoded( { extended : true } ) );
app.use( bodyParser.json() );


// define routes used in application
app.get( '/' , ( req , res ) => {
	res.render('login');
})

app.get('/leave/balance', leaveBalanceController.queryAll );

app.get('/leave/application', async ( req , res ) =>{
	res.render('leave-application');
} );
app.post('/leave/application', leaveApplicationController.createLeaveApplication );

app.get('/leave/application/view', leaveApplicationController.queryAll );
app.post('/leave/application/update', leaveApplicationController.updateLeaveApplicationStatus );

app.get('/test', leaveApplicationController.queryAll);
app.listen( port , async () =>{
	// await fabric.enrollAdmin();
	// await fabric.registerUser();
	console.log( 'Server is up! Listening at port: ' + port ); 
});