const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt-nodejs');
const app = express();
var cors = require('cors');
 var knex = require('knex')({
    client: 'pg',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : '1Discoverysc',
      database : 'smartbrain'
    }
  });
  
  app.use(bodyParser.json());
 app.use(cors());

app.get('/', (req, res)=>{
    knex('users').select('*').then(vals =>res.json(vals))
})

app.post('/signin', (req,res)=>{
    let resv = {}
    resv.state = "default";
    resv.message = "default";
    // Load hash from your password DB.
    let pass = "in";
    let em = "in";
    
    knex.select('*').from('login').then((entry) =>{

        entry.forEach((data)=>{
        if(data.email === req.body.email){
            em = "bb";
            bcrypt.compare(req.body.password, data.hash, function(err, rest) {
                console.log(data.hash);
                console.log(rest);
                if(rest){
                    knex('users').where('email', data.email).then(bres=>{
                        knex('users').select('entries').then((ies) => {
                            let rank=1;
                            ies.forEach(val1 =>{
                            if(val1.entries>resv.message.entries){
                                rank++;
                            }
                            });
                            resv.message={
                                id:data.id,
                                email:data.email,
                                hash:data.hash,
                                name:bres[0].name,
                                entries:bres[0].entries,
                                joined:bres[0].joined,
                                rank: rank
                            }
                            resv.state = "success";
                            res.json(resv);                          
                        })

                    })
                }else{
                    console.log(pass);
                    resv.state ="fail";
                    resv.message = "Wrong password"
                    res.json(resv);
                }
            });
            
        }else{
        }
    }
    )
    if(em === 'in'){

        resv.state ="fail";
        resv.message = "Invalid Email";
        res.json(resv);
    }

 })
}
);

app.post('/register', (req,res)=>{
    let resv = {}
    resv.state = "default";
    resv.message = "default";
    const{email,name,password} = req.body;
    bcrypt.hash(password, null,null,function(err, hash) {
       if(!err){
        knex('users').returning('*').insert({
            email: email,
            name: name,
            joined: new Date()
        }).then((response)=> {
            knex('login').insert({
                hash: hash,
                email: response[0].email,
            }).then(console.log);
           console.log(response);
           resv.state = "success";
           resv.message = response[0];
            res.json(resv);
        }).catch(err => { resv.state = "fail"; if(err.code === "23505"){resv.message = "email address already exists."; res.status(400).json(resv)}});
    console.log(hash);
    
    }
    else{
        resv.state = "fail";
        resv.message = "There is a server error with respect to this password, please consider changing it. Thanks.";
        res.status('400').json(resv);
    }
    });
     
});
app.get('/profile/:id', (req,res)=>{
const{ id }= req.params;
let found = false;
database.users.forEach(user =>{
    if(user.id===id){
        found=true;
      res.json(user);
    }
});

if(!found){
    res.status(404).json('not found');
}

});
app.put('/image',(req, res)=>{
    const{ id }= req.body;
let found = false;
let finent = 0;
knex.select('id', 'hash', 'email',).from('login').then( (ress) => ress.forEach(user =>{
    console.log(id );
    if(user.id===id){
        
        
            knex('users').where('email',user.email).increment('entries',1).returning('entries').then(entr =>{
                
                knex('users').select('entries').then((ies) => {
                    let rank=1;
                    ies.forEach(val1 =>{
                    if(val1.entries>entr[0]){
                        rank++;
                    }
                    });
                    console.log("rank: ", rank);
                    res.json(rank);
                })
            })
        
    }
})
)
});

app.listen(3000,()=>{
    console.log('app is running on port 3000');
})