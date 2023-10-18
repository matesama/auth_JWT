import mongoose from "mongoose";


const PersonSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please insert your username']
    },
    password: {
        type: String,
        required: true
    }
}, {timestamps: true} )

const Person = mongoose.model('Person', PersonSchema);
export default Person