const express = require('express');
const bodyParser = require('body-parser');
const router = require('./router');
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())




//--------USED FOR TESTING--------------------------
    app.get('/',(req,res)=>
    {
    
        res.send('world');
    })
//--------------------------------------------------    

    app.use('/user',router);                            // ROUTING ==


/* LISTENING SERVER.....PORT 2000>>>>>>>>>>>>>>>*/

app.listen(2000,()=>
    {
        console.log('listen on 2000');
        console.log('-----------------------');

    })