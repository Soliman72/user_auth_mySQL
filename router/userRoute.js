const express = require( 'express' );
const router = express.Router();
const userController = require( './../controller/userController' );
const authController = require( './../controller/authController' );

router.post('/login' , authController.login)
router.post('/register' , authController.register)

router.use( authController.protect );

router.route( '/' )
  .get( userController.getAllUsers )  
router.route( '/:id' )
  .get( userController.getUser )
  .patch( userController.updateUser )
  .delete( userController.deleteUser );
    
module.exports = router;