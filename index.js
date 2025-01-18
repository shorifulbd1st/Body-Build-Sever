const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()

const app = express();
const port = process.env.PORT || 5000;

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.o3yie.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});
app.use(cors());
app.use(express.json());
app.use(morgan('dev'))

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        // await client.connect();
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
                expiresIn: '5h'
            });
            res.send({ token })
        })

        const verifyToken = (req, res, next) => {
            if (!req.headers.authorization) {
                return res.status(401).send({ message: 'unauthorized access' })
            }
            const token = req.headers.authorization.split(' ')[1];
            jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
                if (error) {
                    return res.status(401).send({ message: 'unauthorized access' })
                }
                req.decoded = decoded;
                next();
            })
        }

        const usersCollection = client.db('Body-Build-House').collection('users');
        const classCollection = client.db('Body-Build-House').collection('class');
        const trainerCollection = client.db('Body-Build-House').collection('trainer');

        app.post('/users', async (req, res) => {
            const userInfo = req.body;
            const filter = { email: userInfo.email }
            const existingUser = await usersCollection.findOne(filter);
            if (existingUser) {
                return res.send({ message: 'user already exists', insertedId: null })
            }
            const result = await usersCollection.insertOne(userInfo);
            res.send(result)
        })
        app.get('/user', async (req, res) => {
            const result = await usersCollection.find().toArray();

            res.send(result);
        })

        app.get('/class', async (req, res) => {
            const result = await classCollection.find().toArray();

            res.send(result);
        })

        app.get('/trainer', async (req, res) => {
            const result = await trainerCollection.find().toArray();
            res.send(result);
        })
        app.get('/trainer/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await trainerCollection.findOne(query);
            res.send(result);
        })

        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        // console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Body Build House Server Is Running');
})

app.listen(port, () => {
    console.log(`Body Build House prot || ${port}`);
})



