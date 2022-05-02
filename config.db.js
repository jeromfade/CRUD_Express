const res = require('express/lib/response');
const mysql = require('mysql');

//------CONNECTION CREATION------------------------------

const   connect_i = mysql.createConnection
                        ({
                            host    :'localhost',
                            user    :'root',
                            password:'',
                            database:'login_registration'

                        });
//--------------------------------------------------------                        

        connect_i.connect((err)=>{if(err)throw err});       //checks connection

//-------------------------------------------------------- 
      
const searchAndInsert = (mailId,callback)=>
{
    
    let sqlSearch = `SELECT email_id
                    FROM user_detail
                    WHERE email_id = ?`;

        connect_i.query(sqlSearch,mailId,(err,result)=>
            { 
                if(err){throw err}
                return callback(result);
            })

}

//---------------------------------------------------------------

const insert = (insertingData,createDate,insertImg)=>{
    let userName=insertingData.user_name;
    let emailId=insertingData.email_id;
    let mobNum=	insertingData.mobile_num;
    let userPass=insertingData.user_password;
    let imageFile = insertImg.filename;

    const sqlInsert = 'INSERT INTO user_detail(user_name,email_id,mobile_num,user_password,creatime,img_file)VALUES("'
    +userName+'","'+emailId+'","'+mobNum+'","'+userPass+'","'+createDate+'","'+imageFile+'")';   //  
                
             connect_i.query(sqlInsert,(err,result)=>
                {
                    if(err)throw err;
                 //console.log(result[0]);
               }) 
}

//------------------------------------------------------------------

const searchData = (post,callback)=>
{
    let userMail = post.email_id;
    // console.log(userPswd,userMail);

    connect_i.query(
    `
    SELECT * 
    FROM user_detail 
    WHERE email_id =?`,userMail, function (err, result)
    {
        if (err) throw err;
        return callback(result);
     });
}

//----------------------------------------------------------------------

const friendReq=(reciveIds)=>
{
    let s_id=reciveIds.sender_id;
    let r_id=reciveIds.reciver_id;
    
    let sqlRecQuery = "INSERT INTO friend_request(sender_id, reciver_id)VALUES(" + s_id+ ", " + r_id + ")";

        connect_i.query(sqlRecQuery,(err,result)=>
        {
            if(err)throw err;
        })
}

//----------------------------------------------------------------------

const mutualFriend = (insertD,callback)=>
{
    let sqlMutualQuery = 'SELECT * FROM friend_requests  WHERE (sender_id= ? OR reciver_id=?) AND statuz="active"';
    
   

        let a=insertD.user_id;
        //console.log();

    
    connect_i.query(sqlMutualQuery,[a,a],(err,result)=>
    {
       // console.table(result)
        return callback(result);
    })

    //console.log(insertData);

}

const listMutualFriend = (array,callbackq)=>
{
    let ListMutulQuery = 'SELECT * FROM user_detail WHERE id IN('+array+')';

    connect_i.query(ListMutulQuery,(err,result)=>
    {
       // console.table(array)
        return callbackq(result)
    })

}
//----------------------------------------------------------------------

const conforming = (bodyData)=>
{
   //console.log(bodyData);
   let stat=bodyData.statuzz;
   let s_id=bodyData.sender_id;
   let r_id=bodyData.reciver_id;

   let acceptReject='UPDATE friend_requests SET statuz=? WHERE sender_id= ? AND reciver_id=?';

   connect_i.query(acceptReject,[stat,s_id,r_id],(err,result)=>
   {
       if(err) throw err;
       console.log(result);
   })

}


//updating profile-------------------------------------------------------------------------

const profileUpdate = (reqData,updateDate,retdata)=>
{
    //let updateDateT='"'+updateDate+'"';

    let userInput=[reqData.user_name,reqData.mobile_num,updateDate,reqData.user_id];

        let profileUpdateQuery="UPDATE user_detail SET user_name=?,mobile_num=?,updatime=? WHERE id=?";

            connect_i.query(profileUpdateQuery,userInput,(err,result)=>
            {
                if(err)throw err;

                return retdata(result);
            })

}

//--product inserting-----------------------------------------------------------------------------------------

const productInserting=(dataFromBody,lastId)=>
{
    //console.log(dataFromBody);
    let productName=dataFromBody.productName;
    let productDescription=dataFromBody.productDescription;
    let quantity=dataFromBody.quantity;
    let ownerId = dataFromBody.ownerId;
    //let imgOne = ;

    let productQuery = "INSERT INTO products(product_name,owner_id,description,quantity) VALUES ('"+productName+"','"+ownerId+"','"+productDescription+"','"+quantity+"')";

        connect_i.query(productQuery,(err,result)=>
        {
            if(err)throw err;
            let lastInsertId=result.insertId;
            return lastId(lastInsertId);
        })


}
const insertImage = (filteredImg)=>{
    let productImgQuery="INSERT INTO product_img(product_id,image_path,create_date) VALUES ?";

        connect_i.query(productImgQuery,[filteredImg],(err,reslt)=>
        {
            if(err)throw err;
        })
    }

//-------------------------product list-------------------------------------------------------------------------------
const productListing=(req,callbackdata)=>
{
//console.log(req.body);
    let productList="SELECT products.*,product_img.image_path FROM product_img,products WHERE product_img.product_id=1 AND products.id=1";

        connect_i.query(productList,(err,result)=>
        {
            if(err) throw err;

                let filePath=[]; 
                result.forEach(elm=>
                {
                    filePath.push(elm.image_path);
                })
                return callbackdata(filePath,result)
        })

}

//----------------buyerProduct------------------------------------------------------------------------------------------
const buyProduct = (req,curentTime,cllbackbuy)=>
{
    //console.log(req.body);

    let buyProductQuery = "INSERT INTO buy_product(product_id,buyer_id,created_date,buyer_status) VALUES ('"+req.body.productId+"','"+req.body.buyerID+"','"+curentTime+"','"+req.body.statu+"')";
        connect_i.query(buyProductQuery,(err,result)=>
        {
            if(err)throw err;
            return cllbackbuy(result)
        })
}
//----------------cart product list---------------------------------------------------------------------------------------------------------

 const cartproductlisting = (userIdFromReq)=>
 {
   // console.log(userIdFromReq);
    let cartListingProductQuery = "SELECT buy_product.product_id,buy_product.buyer_id,products.product_name,products.description FROM buy_product INNER JOIN products ON products.id = buy_product.product_id WHERE buyer_id=?";
    return new Promise((resolve,reject)=>
    {
         connect_i.query(cartListingProductQuery,userIdFromReq,(err,result)=>
    {
        if (err) throw err;
        //console.log(result); 
        
            //setTimeout(()=>{
                resolve( result);
            //},2000)
            
        
    })
});

 }
//___________________________________________________

const selectProductImage=  (productIdd)=>
{
    let selProductImg = "SELECT product_img.image_path FROM product_img WHERE product_id = "+productIdd;
    return new Promise((resolve,reject)=>
    {
    connect_i.query(selProductImg,(err,resultT)=>
    {
        if(err) throw err;
      //  console.log(resultT); 
      
          resolve(resultT)
        }) ;
        
    })
}
//-----------------------------------------------------



module.exports =
{
    searchAndInsert,
    insert,
    searchData,
    friendReq,
    mutualFriend,
    listMutualFriend,
    conforming,
    profileUpdate,
    productInserting,
    productListing,
    buyProduct,
    cartproductlisting,
    insertImage,
    selectProductImage
    
} 



