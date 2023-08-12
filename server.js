require( 'dotenv' ).config( { path: './config.env' } );
const bcrypt = require( 'bcryptjs' );
const app = require( './app' );
const mysql = require( 'mysql2' );
const AppError = require( './utils/appError' );

// connect database 
const connection = mysql.createConnection( {
  host: process.env.MYSQL_HOST,
  password: process.env.MYSQL_PASSWORD,
  user: process.env.MYSQL_USER,
  port: process.env.MYSQL_PORT,
  database: process.env.MYSQL_DB,
} ).promise();
connection.connect( ( err ) =>
{
  if ( err ){
    console.log( err );
  }
  else{
    console.log( 'DB connect success...' );
  }
} );

// get all User in mySQL 
exports.getAllUSers = async ()=>{
  const [ result ] = await connection.query( "SELECT * FROM users_table " )
  return result;
}

// get one user 
exports.getOneUSer = async ( id , next ) =>
{
  // if id is exist or not 
  const  [userId]  = await connection.query( `
  SELECT id FROM users_table
  WHERE id = ? 
  ` , [ id ] );
  if ( userId[ 0 ][ 1 ] === undefined ){
    return next( new AppError(
      'the user id not found ' , 404
    ))
  }

  const [result] = await connection.query( `
  SELECT * FROM users_table
  WHERE id = ? 
  ` , [ id ] );
  return {
    id,
    name: result[ 0 ].name,
    email: result[ 0 ].email,
  }
}

// create user in sql  
exports.createUser = async ( name, email, password, next ) =>
{
  const [emailSQL] = await connection.query( `
  SELECT email FROM users_table 
  WHERE email = ? 
  ` , [ email ] );

  if ( emailSQL[0] != undefined  ){
    return next( new AppError( 'the email is already exist ! ', 401 ) );
  } 
    const hashedPassword = await bcrypt.hash( password, 12 );

    const [ result ] = await connection.query( `
    INSERT INTO users_table (name , email , password) 
    VALUES ( ? , ? , ?)
    ` , [ name, email, hashedPassword ] );
    return {
      id: result.insertId,
      name,
      email,
    }
};

// login with mysql 
exports.login = async (email , password , next) =>
{

  // check if email exist or not
  const [emailSQL] = await connection.query( `
  SELECT email FROM users_table
  WHERE email = ? ;
  ` , [ email ] );

  if ( emailSQL[0] === undefined ){
    return next( new AppError( 'the email is not exist ! ', 401 ) );
  };

  // getting the user his owner this email 
  const [user] = await connection.query( `
  SELECT * FROM users_table
  WHERE email = ? ;
  ` , [ email ] );

  // user password hashed 
  const userPassword = user[ 0 ].password;
  // compare password 
  const correct = await bcrypt.compare( password, userPassword );
  if ( !correct ){
    return next(
      new AppError( 'the user password is not correct ', 401 ) );
  }

  return user[ 0 ];
}

// update user 
exports.updateUser = async ( name, email, id , next ) =>
{
   // if id is exist or not 
  const  [userId]  = await connection.query( `
  SELECT id FROM users_table
  WHERE id = ? 
  ` , [ id ] );
  if ( userId[ 0 ][ 1 ] === undefined ){
    return next( new AppError(
      'the user id not found ', 404
    ) );
  };

  if ( email==='')
  {
    const result = await connection.query( `
  UPDATE  users_table 
  SET name = ?
  WHERE id = ? ;
  ` , [ name, id ] )
    return {
      id,
      name,
    }
  };
  if ( name==='' )
  {
    const result = await connection.query( `
    UPDATE  users_table 
    SET email = ?
    WHERE id = ? 
    ` , [email, id] );
    return {
      id,
      email,
    }
  }
  if ( name && email )
  {
    const result = await connection.query( `
    UPDATE  users_table 
    SET name = ? , email = ? 
    WHERE id = ? ;
    ` , name, email, id )
    return {
      id,
      name,
      email,
    }
  }
};

// delete user 
exports.deleteUser =async ( id ) =>
{
  await connection.query( `
  DELETE FROM users_table 
  WHERE id = ? ;
  `, [ id ] );
}


const port=process.env.PORT || 3000
app.listen( port, () =>
{
  console.log(`app listen in port ${port}...`);
})