const express = require('express');
const router = express.Router();
const {body , validationResult} = require('express-validator');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const authenticate  = require('../middlewares/authenticate');

/*................User Registration................*/
/*
usage: register user
url : /api/users/register
fields : name , email , password
method : post
access : public
*/
router.post('/register' ,[
    //server side validation
    body('name').notEmpty().withMessage('Name is required'),
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (request , response)=>{
    //check error, if any
    let errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(401).json({errors : errors.array()});
    }
    try {
        //get the data filled by client
        let { name , email , password} = request.body;
        //check user is already there or not
        let user =  await User.findOne({email : email});
        if(user){
            return response.status(401).json({errors : [{msg : 'user already exists'}]});
        }
        //encode password
        const salt = await  bcrypt.genSalt(10);
        password = await bcrypt.hash(password , salt);

        //gravatar image
        let avatar = gravatar.url(email , {
            s:'300',
            r:'pg',
            d:'mm'
        });
        //address
        let address = {
            flat:' ',
            landmark : ' ',
            street :' ',
            city:' ',
            state:' ',
            country :' ',
            pin:' ',
            mobile:' '
        };

        //save user to database
        user = new User({name , email , password , avatar , address});
        user = await user.save();
        response.status(200).json({msg:'Registration success'});


    }catch (error) {
        console.log(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});

/*.................User Login ....................*/
/*
usage: login user
url : /api/users/login
fields :  email , password
method : post
access : public
*/
 router.post('/login',[
    body('email').notEmpty().withMessage('Email is required'),
    body('password').notEmpty().withMessage('Password  is required')
] ,async  (request , response)=>{
    //check error ,if any
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        response.status(401).json({errors : errors.array()});
    }
    try {
        //get the data filled by client
        let {email ,password}  = request.body;
        //check user user's data is in the database or not
        let user = await User.findOne({email : email});
        if(!user){
            return response.status(401).json({errors : [{msg : 'Invalid credentials'}]});
        }

        //check the password
        let isMatch = await bcrypt.compare(password , user.password);
        if(!isMatch){
            return response.status(401).json({errors : [{msg : 'Invalid credentials'}]});
        }
        //create token
        let payload = {
            user : {
                id : user.id,
                name : user.name
            }
        };
        jwt.sign(payload , process.env.JWT_SECRET_KEY , {expiresIn: 360000000} , (err , token)=>{
            if (err) throw err;
            response.status(200).json({
                msg : 'Login Success',
                token : token
            });
        })
    }
    catch (error) {
        console.log(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});


/*
   @usage : Get User Info
   @url : /api/users/
   @fields : no-fields
   @method : GET
   @access : PRIVATE
*/
router.get('/', authenticate , async (request , response) => {
    try {
        let user = await User.findById(request.user.id).select('-password');
        response.status(200).json({user : user});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});




/*
    @usage : Update Address of a User
    @url : /api/users/address
    @fields : flat , street , landmark , city , state , country , pin, mobile
    @method : POST
    @access : PRIVATE
 */
router.post('/address' ,authenticate ,[
    body('flat').notEmpty().withMessage('Flat is Required'),
    body('street').notEmpty().withMessage('Street is Required'),
    body('landmark').notEmpty().withMessage('Landmark is Required'),
    body('city').notEmpty().withMessage('City is Required'),
    body('state').notEmpty().withMessage('State is Required'),
    body('country').notEmpty().withMessage('Country is Required'),
    body('pin').notEmpty().withMessage('Pin is Required'),
    body('mobile').notEmpty().withMessage('Mobile is Required')
],  async (request , response)=>{
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        response.status(401).json({errors : errors.array()});
    } 

    try {
    let address = {
        //take the data which will be filed by client
        flat : request.body.flat,
        street : request.body.street,
        landmark : request.body.landmark,
        city : request.body.city,
        state : request.body.state,
        country : request.body.country,
        pin : request.body.pin,
        mobile : request.body.mobile
    };
    let user = await User.findById(request.user.id);
    user.address = address;
    user =  await user.save();
    response.status(200).json({
        msg:'Address  Update Success',
        user : user
    });
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});


module.exports = router;