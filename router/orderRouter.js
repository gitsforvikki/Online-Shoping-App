const express = require('express');
const router = express.Router();
const authenticate = require('../middlewares/authenticate');
const Order = require('../models/Order');
const User  =  require('../models/User');
const {body , validationResult} = require('express-validator');



/*
@usage : Place order
@url : /api/orders/
@fields : no fields
@method : get
@access : private
*/


router.post('/' ,authenticate , [
    body('items').notEmpty().withMessage('Items is Required'),
    body('tax').notEmpty().withMessage('Tax required'),
    body('total').notEmpty().withMessage('Total required'),
] , async (request , response)=>{
    let errors = validationResult(request);
    if (!errors.isEmpty()){
        response.status(401).json({errors : errors.array()});
    }
    try {
        let {items , tax , total} = request.body;
        let user = await User.findById(request.user.id);
        let order = new Order({
            name :user.name,
            email : user.email,
            mobile : user.address.mobile,
            tax : tax,
            total :total,
            items:items
        });
        //save to database
        order = await order.save();
        response.status(200).json({
            msg : 'order Placed',
            order : order
        });

    }
    catch (error) {
        console.log(error);
        response.status(500).json({errors : {msg : error.message}});
    }
});


/*
    @usage : Get All Orders
    @url : /api/orders/all
    @fields : no-fields
    @method : GET
    @access : PRIVATE
 */
router.get('/all' , authenticate , async (request , response) => {
    try {
        let user = await User.findById(request.user.id);
        let orders = await Order.find({email : user.email});
        response.status(200).json({orders : orders});
    }
    catch (error) {
        console.error(error);
        response.status(500).json({errors : [{msg : error.message}]});
    }
});


module.exports = router;