import express from 'express';
import Person from '../models/Person.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const loginRouter = express.Router();
loginRouter.use(express.urlencoded({ extended: true }));

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

    const tokenData = token.split(' ')[1];
    console.log(tokenData)

    jwt.verify(tokenData, secret, (err, username) => {
        if(err){
            return res.sendStatus(401)
        }
        req.username = username;
        next();
    })
} 




//Check all users in DB
loginRouter.get('/', async (req, res) => {
    const response = await Person.find(Person.username);
    res.json(response);
})

//register Persons
loginRouter.post('/registerPerson', async (req, res) => {
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
loginRouter.get('/login', async (req, res) => {
    try {
        res.send(`
        <h1>Login Page:</h1>
        <form action='/connect' method='post'>
            <label for='username'>Username:</label>
            <input type='text' id='username' name='username'> 
            </br>
            <label for='password'>Password:</label>
            <input type='text' id='password' name='password'> 
            </br>
            <input type='submit' value='Submit'>
        </form>
        `);

    } catch(err){
        res.status(500).send(err.message);
    }
})

/*//Login process with username and password to get token first Part with static value
loginRouter.post('/connect', async (req, res) => {
    const {username, password} = req.body;
    try {
    if(!username === "John" && password === "Doe") {
        return res.redirect('/login')
    } else {
        const token = generateToken({username: "John"});
        if(!token){
            res.redirect('/login');
        }
        res.set('token', token);
        res.set('Access-Control-Expose-Headers', 'token');
        
        res.send(`
        <h1>Check Token Validity:</h1>
        <form action='/checkJWT' method='post'>
            <label for='token'>Token:</label>
            <input type='text' id='token' name='token'> 
            <input type='submit' value='Submit'>
        </form>
        `);
    }
    } catch(err){
        res.status(500).send(err.message);
    }
})*/

//Login process with username and password to get token connected to Mongo DB
loginRouter.post('/connect', async (req, res) => {
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
loginRouter.post('/checkJWT', authMiddlewareFunc, (req, res) => {
        
    try{
        const {token} = req.body;
        jwt.verify(token, secret, (err, decoded) => {
            if(err){
                return res.redirect('/login');
            }
            console.log(decoded)
        });
    } catch(err){
        res.status(500).send(err.message);
    }
})




export default loginRouter;