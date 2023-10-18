import express from 'express';
import Person from '../models/Person.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';
const loginRouter = express.Router();
loginRouter.use(express.urlencoded({ extended: true }));
//loginRouter.use(cors());
const secret = process.env.SECRET_TOKEN;

const generateToken = (data) => {
    return jwt.sign(data, secret, {expiresIn: '1800s'});
}


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
        console.log("works get login");
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


//Login process with username and password to get token
loginRouter.post('/connect', async (req, res) => {
    const {username, password} = req.body;
    try {
        /*const person = await Person.findOne({username})
        if(!person){
            return res.status(400).redirect('/login')
        }
        //Password check

        const passwordCheck = await bcrypt.compare(password, person.password);
        const person = await Person.findOne({username})
        if(!person){
            return res.status(400).redirect('/login')
        }
        //Password check

        //const passwordCheck = await bcrypt.compare(password, person.password);*/

    if(!username === "John" && password === "Doe") {
        return res.redirect('/login')
    } else {

        const token = generateToken({username: "John"});
        if(!token){
            res.redirect('/login');
        }

        console.log(token);
        res.set('token', token);
        res.set('Access-Control-Expose-Headers', 'token')
        
        res.send(`
        <h1>Check Token Validity:</h1>
        <form action='/checkJWT' method='post'>
            <label for='token'>Token:</label>
            <input type='text' id='Token' name='Token'> 
            <input type='submit' value='Submit'>
        </form>
        `);
    }
    } catch(err){
        res.status(500).send(err.message);
    }
})



export default loginRouter;