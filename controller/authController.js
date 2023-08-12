const DB = require( './../server' );
const AppError = require( './../utils/appError' );
const catchAsync = require( './../utils/catchAsync' );
const { promisify } = require( 'util' )
const jwt = require( 'jsonwebtoken' );

const createToken = ( id ) =>
{
    return jwt.sign( { id}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    } );
}

exports.register = catchAsync( async ( req, res, next ) =>{
  const { name, email, password } = req.body;
  // check if it writen 
  if ( !name || !email || !password ){
    return next( new AppError( 'user must have name, email and password to register', 401 ) );
  }
  const user = await DB.createUser( name, email, password, next );

  // create token
  const token = createToken( user.id );
  res.status( 201 ).json( {
    status: 'success',
    token,
    data: {
      user
    }
  } )
} );

exports.login = catchAsync( async ( req, res, next ) =>
{
  const { email, password } = req.body;
  // check if it writen 
  if ( !email || !password )
  {
    return next( new AppError( 'write email and password to login ', 401 ) );
  }
  const user = await DB.login( email, password, next );
  
  // create token
  const token = createToken( user.id );
  
  res.status( 201 ).json( {
    status: 'success',
    token,
    data: {
      user
    }
  } )
} );

// protect routes 
exports.protect = catchAsync( async ( req, res, next ) =>
{
  // 1) getting the token 
  let token;
  if ( req.headers.authorization && 
    req.headers.authorization.startsWith( 'B' ) ){
    token = req.headers.authorization.split( ' ' )[ 1 ];
  }
  if ( !token ){
    return next(new AppError('not found token , please login and try again ...'))
  }
  // verification token 
  const decoded =await promisify( jwt.verify )( token, process.env.JWT_SECRET );

  // if user still exist
  const userCurrent = await DB.getOneUSer( decoded.id , next );
  if ( !userCurrent ){
    return next(
      new AppError( 'this user is no longer exist please, login and try again ', 404 ) )
  }

  // access to protected route 
  req.user = userCurrent;
  next();
} )
