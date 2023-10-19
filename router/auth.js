import express from 'express';
import Person from '../models/Person.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const authRouter = express.Router();
//Middleware to parse to data html data
authRouter.use(express.urlencoded({ extended: true }));

const secret = process.env.SECRET_TOKEN;

const generateToken = (data) => {
    return jwt.sign(data, secret, {expiresIn: '1800s'});
}

const authMiddlewareFunc = (req, res, next) => {
    const {token} = req.body;
    console.log(token);
    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, secret, (err, username) => {
        if(err){
            return res.sendStatus(401)
        }
        req.username = username;
        next();
    })
} 




//Check all users in DB
authRouter.get('/', async (req, res) => {
    const response = await Person.find(Person.username);
    res.json(response);
})

//register Persons
authRouter.post('/registerPerson', async (req, res) => {
    const {username, password} = req.body;
    try {

        const hashPassword = await bcrypt.hash(password, 10);
        const response = await Person.create({username, password: hashPassword})
        res.status(201).json(response);

    } catch(err){
        res.status(500).send(err.message);
    }
})

//Login Form
authRouter.get('/login', async (req, res) => {
    try {
        res.send(`
        <h1>Login Page:</h1>
        <form action='/connect' method='post'>
            <label for='username'>Username:</label>
            <input type='text' id='username' name='username' required> 
            </br>
            <label for='password'>Password:</label>
            <input type='password' id='password' name='password' required> 
            </br>
            <input type='submit' value='Login'>
        </form>
        `);

    } catch(err){
        res.status(500).send(err.message);
    }
})

/*//Login process with username and password to get token first Part with static value
authRouter.post('/connect', async (req, res) => {
    const {username, password} = req.body;
    try {
        //check if the username John and password Doe
    if(!username === "John" && password === "Doe") {
        return res.redirect('/login')
    } else {
        //create token from generateToken
        const token = generateToken({username: "John"});
        if(!token){
            res.redirect('/login');
        }
        //Set the jwt as a header to the response
        res.set('token', token);
        //other option
        res.header("Authorization", 'Bearer ' + token) //Authorization property, Bearer value 
        //Display in headers
        res.set('Access-Control-Expose-Headers', 'token');
        
        res.send(`
        <h1>Check Token Validity:</h1>
        <form action='/checkJWT' method='post'>
            <label for='token'>Token:</label>
            <input type='text' id='token' name='token'> 
            <input type='submit' value='Login'>
        </form>
        `);
    }
    } catch(err){
        res.status(500).send(err.message);
    }
})*/

//Login process with username and password to get token connected to Mongo DB
authRouter.post('/connect', async (req, res) => {
    const {username, password} = req.body;
    try {
        const person = await Person.findOne({username})
        if(!person){
            return res.redirect('/login')
        }
        //Password check
        const passwordCheck = await bcrypt.compare(password, person.password);
        if(!passwordCheck) {
            res.redirect('/login');
        }
        //Generate Token
        const token = generateToken({username: person.username});
        if(!token){
            res.redirect('/login');
        }
        //Set and Display Token in Header
        res.set('token', token);
        res.set('Access-Control-Expose-Headers', 'token');
        res.set('username', person.username);
        res.set('Access-Control-Expose-Headers', 'username');
        res.send(`
        <h1>Check Token Validity:</h1>
        <form action='/checkJWT' method='post'>
            <label for='token'>Token:</label>
            <input type='text' id='token' name='token'> 
            <input type='submit' value='Submit'>
        </form>
        `);
    } catch(err){
        res.status(500).send(err.message);
    }
})

//Verify via JWT token and redirect to the admin page 
authRouter.post('/checkJWT', authMiddlewareFunc, (req, res) => {
        
    try{
        const {token} = req.body;
        jwt.verify(token, secret, (err, decoded) => {
            if(err){
                return res.redirect('/login');
            }
            console.log(decoded)
            res.redirect('/admin')
        });
    } catch(err){
        res.status(500).send(err.message);
    }
})




export default authRouter;