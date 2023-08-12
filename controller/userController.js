const DB = require( './../server' );
const AppError = require( './../utils/appError' );
const catchAsync = require( './../utils/catchAsync' );

exports.getAllUsers = catchAsync (async( req, res,next ) =>{
    const users = await DB.getAllUSers();
  res.json( {
    status: 'success',
    result : users.length,
      users,
    } );
} )

exports.getUser =catchAsync(async ( req, res ,next) =>
{
  const user = await DB.getOneUSer( req.params.id  , next);
  if ( !user ){
    return next( new AppError( 'not found this user', 404 ) );
  }
  res.status( 200 ).json( {
    status: 'success',
    data: {
      user
    }
  })
} )

exports.updateUser = catchAsync( async( req, res,next ) =>
{
  const { name, email } = req.body;
  let user;
  if ( name ){
    user = await DB.updateUser(name , '',req.params.id , next)
  }
  if ( email ){
    user = await DB.updateUser( '' , email, req.params.id , next)
  }
  if ( name && email ){
    user = await DB.updateUser(name , email , req.params.id , next)
  }

  res.status( 201 ).json( {
    status: 'success',
    data: {
      user
    }
  } );
})
exports.deleteUser =catchAsync( async( req, res,next ) =>
{
  await DB.deleteUser( req.params.id );
  // if ( !user ){
  //   return ...
  // }
  res.status( 204 ).json( {
    status: 'success',
    data: 'deleted'
  } );
})