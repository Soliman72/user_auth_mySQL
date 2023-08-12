const express = require( 'express' );
const app = express();
const path=require('path')
const userRoute = require( './router/userRoute' );
const AppError = require('./utils/appError')
const globalErrorHandle = require( './controller/errorController' );

//body parser
app.use( express.json() );

// mounting Route
app.use( '/api/v1/users', userRoute )

// middleware handle unknown routes 
app.use( '*', ( req, res, next ) =>
{
  console.log('hereee');
  return next( new AppError( `can\'t found this url ${ req.originalUrl } `, 404 ) );
} );

// global error handling 
app.use( globalErrorHandle );

module.exports = app;

