const express = require('express');
const userModel = require('./models/userModel')
const app = express();
const bcrypt= require('bcrypt');

app.use(express.json());


app.post('/signup-user',async(req,res)=>{
    let {fullName,email,password} = req.body;
    const existingUser = await userModel.findOne({email})
    if(existingUser) return res.status(403).json({error:true, message:"user already exist"});

    bcrypt.genSalt(10,(err,salt)=>{
        bcrypt.hash(password,salt,async(err,hash)=>{
            let newuser= await userModel.create({
                fullName,email,password:hash
            })
            // let token=jwt.sign({email},secretKey);
            res.send(newuser);
            res.status(200).json(newuser);
        })
    })
})

app.post('/login-user',async(req,res)=>{
    let existingUser = await userModel.findOne({email:req.body.email});
    if(!existingUser) return res.send("Something went wrong");

    console.log(existingUser.password,req.body.password);
    bcrypt.compare(req.body.password, existingUser.password,(err, result)=>{
        // console.log(result)
        if(result) res.status(200).json({message: 'Login successful',email:req.body.email})
        else res.status(401).json('Something went wrong')
    })
})


app.listen(3000,()=>console.log('server shuru'))

