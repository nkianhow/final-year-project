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
	LeaveController = require('./src/controllers/leave');

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
	leaveController = new LeaveController();

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
app.get('/leave/apply', async ( req , res ) =>{ res.render('leave-application'); } );
app.post('/leave/apply', leaveController.createLeaveApplication );
app.get('/leave/view', leaveController.queryApplicationByUsername );
app.get('/leave/pending', leaveController.queryAllPendingApplications );
app.get('/leave/reviewed', leaveController.queryReviewedApplicationsByDepartment );
app.post('/leave/update',leaveController.updateLeaveApplicationStatus );

app.listen( port , async () =>{
	// await fabric.enrollAdmin();
	// await fabric.registerUser();
	console.log( 'Server is up! Listening at port: ' + port ); 
});