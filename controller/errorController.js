const AppError = require( './../utils/appError' );

const handleJWTErr = () =>
  new AppError( 'not faild this token ! ', 404 );

const sendErrorDev = ( err, res ) =>{
  return res.status( err.statusCode ).json( {
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack
  } );
}
const sendErrorProd = ( err, res ) =>
{
  if ( err.Operational ){
    return res.status( err.statusCode ).json( {
    status: err.status,
    message: err.message,
    } );
  }
  
  console.log( 'ERROR 💥 : ', err );
  return res.status(500).json( {
    status:'error',
    message: 'some thing went is wrong',
    } );
  
}


module.exports = ( err, req, res, next ) =>{
  {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    if ( process.env.NODE_ENV === 'development' ){
      sendErrorDev(err,res);
    }
    else if ( process.env.NODE_ENV === 'production' ){
      let error = { ...err };
      error.message = err.message;
      if ( error.name === 'JsonWebTokenError' ) error = handleJWTErr();
      
      sendErrorProd( error, res );
    }
  }}