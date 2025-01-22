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
        const trainerRegisterCollection = client.db('Body-Build-House').collection('trainerRegister');
        const paymentCollection = client.db('Body-Build-House').collection('payment');

        const verifyAdmin = async (req, res, next) => {
            const email = req.decoded.email;
            const query = { email };
            const user = await usersCollection.findOne(query);
            const isAdmin = user?.role === 'admin';
            if (!isAdmin) {
                return res.status(403).send({ message: 'forbidden access' });
            }
            next();
        }




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
        app.patch('/user/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email };
            const updateDoc = {
                $set: {
                    role: 'trainer'
                }
            }
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        app.get('/user/:email', async (req, res) => {
            const email = req.params.email;
            console.log(email)
            const query = { email }
            console.log(query)
            const result = await usersCollection.findOne(query);
            res.send(result);
        })

        // admin role 
        app.get('/user/admin/:email', verifyToken, async (req, res) => {
            const email = req.params.email;
            if (email !== req.decoded.email) {
                return res.send(403).send({ message: 'forbidden access' });
            }
            const query = { email };
            const user = await usersCollection.findOne(query);
            let admin = false;
            if (user) {
                admin = user?.role === 'admin'
            }
            res.send({ admin })
        })


        app.get('/class', async (req, res) => {
            const result = await classCollection.find().toArray();

            res.send(result);
        })
        app.get('/class/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await classCollection.findOne(query);
            res.send(result)
        })
        app.get('/class-name/:name', async (req, res) => {
            const name = req.params.name;
            const query = { className: name };

            const result = await classCollection.findOne(query);
            res.send(result)
        })
        app.patch('/class-update/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            // console.log('update', id)
            const query = { _id: new ObjectId(id) }
            const update = {
                $inc: { count: 1 },
            }
            const result = await classCollection.updateOne(query, update);
            res.send(result);
        })

        app.post('/class', verifyToken, verifyAdmin, async (req, res) => {
            const classInfo = req.body;
            const result = await classCollection.insertOne(classInfo);
            res.send(result);
        })

        app.get('/top-class', async (req, res) => {
            const result = await classCollection.find().sort({ count: -1 }).limit(6).toArray();
            res.send(result)
        })
        // trainer registration
        app.post('/trainer-register', async (req, res) => {
            const userInfo = req.body;
            const result = await trainerRegisterCollection.insertOne(userInfo);
            res.send(result)
        })

        app.get('/apply-trainers', async (req, res) => {
            const result = await trainerRegisterCollection.find().toArray();
            res.send(result);
        })
        app.get('/apply-trainers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await trainerRegisterCollection.findOne(query);
            res.send(result);
        })
        app.delete('/apply-trainers/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await trainerRegisterCollection.deleteOne(query);
            res.send(result)
        })


        // trainer 
        app.post('/trainer', async (req, res) => {
            const userInfo = req.body;
            const result = await trainerCollection.insertOne(userInfo);
            res.send(result)
        })
        app.patch('/add-slot', async (req, res) => {
            const { email, selectClass, slotName, slotTime } = req.body;

            const query = { email };

            const update = {};
            if (selectClass) {
                const selectClassArray = Array.isArray(selectClass) ? selectClass : [selectClass];
                update.$addToSet = {
                    ...(update.$addToSet || {}),
                    selectClass: { $each: selectClassArray },
                };
            }
            if (slotName) {
                const slotNameArray = Array.isArray(slotName) ? slotName : [slotName];
                update.$addToSet = {
                    ...(update.$addToSet || {}),
                    slotName: { $each: slotNameArray },
                };
            }

            if (slotTime !== undefined) {
                update.$inc = { slotTime };
            }

            const result = await trainerCollection.updateOne(query, update, { upsert: true });
            res.send(result)


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

        app.get('/trainer-email/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email };
            const result = await trainerCollection.findOne(filter);
            res.send(result);
        })


        // payment
        app.post('/create-payment-intent', verifyToken, async (req, res) => {
            const { price } = req.body;
            const amount = parseInt(price * 100);
            const paymentIntent = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            });
            res.send({
                clientSecret: paymentIntent.client_secret
            })

        })

        app.post('/payment', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment);
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



