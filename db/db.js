import mongoose from 'mongoose';

mongoose.connect(process.env.MONGO_DB, {
    useNewURLParser: true,
    useUnifiedTopology: true
})
.then(() => {
    console.log('DB connection successful')
})
.catch((e) => console.log(e.message))

const client = mongoose.connection;
client.on('error', (e) => console.log(e.message))
export default client;