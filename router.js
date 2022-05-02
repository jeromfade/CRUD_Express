const express=require('express');
const app = express();
const router = express.Router();
const insertData=require('./config.db');
const multer = require('multer');
const path = require('path');

app.use(express.static('./public'));

//---------------------------------date and time-------------------------------------------------------------------
function todayDate(){
    let date_ob = new Date(); let date = ("0" + date_ob.getDate()).slice(-2); 
    let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
    let year = date_ob.getFullYear();
    let hours = date_ob.getHours(); 
    let minutes = date_ob.getMinutes(); 
    let seconds = date_ob.getSeconds();
    var today = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

    return today;
}
//---------------------------------------multer-----------------------------------------------------------------------------------
var storage = multer.diskStorage({
    destination: (req, file, callBack) => {
        callBack(null, './public/images/')     // './public/images/' directory name where save the file
    },
    filename: (req, file, callBack) => {
        callBack(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
 
var upload = multer({
    storage: storage
});
//--------------------------------------------------------------------------------------------------------------
router.post('/registration',upload.single('img_file'),(req,res)=>
{

    let createDate=todayDate();

    let mailId=req.body.email_id;

    let insertingData=req.body;

    let insertImg = req.file;

    console.log(insertingData);


    insertData.searchAndInsert(mailId,(result)=>
    {
        if(result[0]==undefined)
        {
            insertData.insert(insertingData,createDate,insertImg);
            res.send({'response':'sucessfully inserted'})
        }
        else
        {
            res.send({'response':'already_exist'});
        }
    })
})

//-----------------------------------------------------------------------

router.post('/login', function (req, res) 
{
    let post = 
        {
            email_id      : req.body.email_id
        };

    insertData.searchData(post, function(result)
    {  
        stuff_i_want = 
        {
            user_name:result[0].user_name,
            email_id:result[0].email_id,
            mobile_num:result[0].mobile_num
        };
        res.send(stuff_i_want);
        
    });


});

//----------------------------------------------------------------------

router.post('/friendrequest',(req,res)=>
{
    let reciveIds=
    {
        sender_id:req.body.sender_id,
        reciver_id:req.body.reciver_id
    }
    insertData.friendReq(reciveIds)

})

//------------------------------------------------------------------------
router.post('/friendslist',(req,res)=>
{
    
        let useId=req.body.user_id;
        let array=[];
    insertData.mutualFriend(req.body,function(result)
    {
        

        result.forEach(element => 
            { 

                let inId=element.sender_id;
                let rec=element.reciver_id;

                    if(useId==inId)
                    {
                        array.push(rec)
                    }
                    else if(useId==rec)
                    {
                        array.push(inId);
                    }

            });
        insertData.listMutualFriend(array,function(result)
        {
            if(result==undefined){
                let obj=
                {
                    status:false,
                    message:'data not fetched'
                }
                res.send(obj)
            }else{
                let recArray=[];
          

            result.forEach(ele=>
                {
                let id =ele.id;
                let user_name=ele.user_name;
                let email_id=ele.email_id;
                let mobile_num=ele.mobile_num;
                let created_time=ele.created_time;
                console.log(ele);

                    recArray.push({id,user_name,email_id,mobile_num,created_time})
            })
            console.log(recArray);
            let obj = 
            {
                status:true,
                message:'data fetched',
                data:recArray
            }
             res.send(obj)

        }
        })
    })
       
});

//-friend request accepting and rejecting-------------------------------------------------------

router.post('/accept',(req,res)=>
    {
        let status=req.body.statuzz
        //console.log(active);
        if(status=='accept'){
            insertData.conforming(req.body)
            res.send({"msg":"request accepted"});
        }
        else if(status=='reject'){
            insertData.conforming(req.body)
            res.send({"msg":"request rejected"})

        }
        
    })

//------------------------------------------profile updting-----------------------------------------------------------------
router.post('/updateprofile',(req,res)=>
{
    let updateDate=todayDate();

    insertData.profileUpdate(req.body,updateDate,(result)=>
    {
      
        let resObj=
        {
            status:true,
            message:"sucessfully Updated",
        }
        res.send(resObj)
   
    })
    
})    
//----------------------------------------------products--------------------------------------------
router.post('/insertproduct',upload.array('imgOne[]'),(req,res)=>
{
    let createImgTime=todayDate();
    let dataFromBody=req.body;
    let imgDataFromBody=req.files;
    //console.log(imgDataFromBody);
    //console.log(dataFromBody);
    insertData.productInserting(dataFromBody,function(lastInsertId)
                                {   
                                    let filteredImg = []; 

                                    imgDataFromBody.forEach(el=>
                                        {
                                            filteredImg.push([lastInsertId,el.originalname,createImgTime]);
                                        })
                                        insertData.insertImage(filteredImg);
                                        res.send({"status":true,"message":"successfully prodect inserted"});

                                });
});

//--------------------------------------------product list-------------------------------------------
router.post('/productlist',(req,res)=>
{
    //console.log(req.id);
    insertData.productListing(req,(filePath,result)=>
    {
        let resultObj=
        {
            "status":true,
            "msg":"sucessfull",
            
            "id":result[0].id,
            "owner_id":result[0].owner_id,
            "product_name":result[0].product_name,
            "description":result[0].description,
            "quantity":result[0].quantity,
            "img":filePath
        }
        res.send(resultObj)
    });

})
//----------------------buy the product----------------------------------------------------------------

router.post('/buyerproduct',(req,res)=>
{
    let curentTIme=todayDate();
    insertData.buyProduct(req,curentTIme,(result)=>
    {
        if(result == undefined){

            res.send({"status":false,"msg":"nothing is inserted into cart"})
        }else{
            res.send({"status":true,"msg":"item inserted into cart"})

        }
    })
})

//------------------list buyer product--------------------------------------------------------------------

router.post('/testing',async(req,res)=>
{
    let userIdFromReq = req.body.user_id;

     insertData.cartproductlisting(userIdFromReq).then((result)=>
     {
         let arra=[];
       // console.log(result);
       result.forEach((elm)=>
       {
           console.log(elm.product_id);
           insertData.selectProductImage(elm.product_id).then((resultT)=>
           {
               //console.log(resultT);
               let a=[];
               resultT.forEach(e=>{
                   console.log(e.image_path);
                   let imgObj=
                   {
                       "imgPath":"http://localhost:2000/public/images"+e.image_path
                   }
                   a.push(imgObj)

           });
           let obje=
                    {
                        "product_id":elm.product_id,
                        "buyer_id":elm.buyer_id,
                        "product_name":elm.product_name,
                        "images":a
                    };
                 arra.push(obje)
         })
       })
       setTimeout(()=>{
       console.log(arra);
       res.send(arra)

       },1000)
    });
})

module.exports = router;