const express = require('express');
//initialize express
const app = express();

const cors = require('cors');
const dotEnv = require('dotenv');
const mongoose = require('mongoose');
const path = require('path');

//configure cors
app.use(cors());

//configure express to receive form data
app.use(express.json());

//configure dotenv
dotEnv.config('./.env');


//here i will not hard-code hostname and port number due to deployment purpose , it will take automatically

const port = process.env.PORT || 5000;

//configure mongodb connection
mongoose.connect(process.env.MONGO_DB_CLOUD_URL , {
    useUnifiedTopology : true,
    useCreateIndex:true,
    useNewUrlParser:true,
    useFindAndModify:false
}).then((response)=>{
    console.log('Connect to MongoDb cloud successfully......! ');
}).catch((error)=>{
    console.log(error);
    process.exit(1);
});


//simple request

app.get('/', (request , response) => {
    response.send(`<h2>Welcome to Online Shopping Application Backend</h2>`);
});

/*//for deployment purpose
if(process.env.NODE_ENV === "production"){
    app.use(express.static(path.join(__dirname , 'client' , 'build')));
    app.get('/', (request,response) => {
        response.sendFile(path.join(__dirname , 'client' , 'build' , 'index.html'));
    });
}*/


//router configuration
app.use('/api/users' , require('./router/userRouter'));
app.use('/api/products' , require('./router/productRouter'));
app.use('/api/payments' , require('./router/paymentRouter'));
app.use('/api/orders' , require('./router/orderRouter'));




app.listen(port , ()=>{
    console.log(`Express server is started at PORT : ${port}`);
});