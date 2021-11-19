const express = require('express');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const { MongoClient } = require('mongodb');
const port = process.env.PORT || 5002;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vgthc.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

async function run() {
    try {
        await client.connect();
        const database = client.db('fancyWorld');
        const fancyHomeCollection = database.collection('homeCars')
        const carsCollection = database.collection('cars');
        const ordersCollection = database.collection('orders')
        const usersCollection = database.collection('users')
        const ratingsCollection = database.collection('ratings')

        // Get api
        app.get('/display', async (req, res) => {
            const cursor = fancyHomeCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        });
        // Get api
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const order = await cursor.toArray();
            res.send(order);
        });

        app.get('/cars', async (req, res) => {
            const cursor = carsCollection.find({});
            const cars = await cursor.toArray();
            res.send(cars);
        });
        // post cars
        app.post('/cars', async (req, res) => {
            const car = req.body;
            const result = await carsCollection.insertOne(car);
            res.json(result);
        })


        // Delete cars
        app.delete('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await carsCollection.deleteOne(query);
            res.json(result);
        })
        // Delete orders
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        })


        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const cursor = ordersCollection.find(query);
            const order = await cursor.toArray();
            res.send(order);
        });




        // get single homeCar by id
        app.get('/display/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cars = await fancyHomeCollection.findOne(query);
            res.json(cars);
        });

        app.get('/cars/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const cars = await carsCollection.findOne(query);
            res.json(cars);
        });

        // post order
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result);
        })

        // post users
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.json(result);
        })
        // post users
        app.post('/ratings', async (req, res) => {
            const rating = req.body;
            const result = await ratingsCollection.insertOne(rating);
            res.json(result);
        })

        // load comment
        app.get('/ratings', async (req, res) => {
            const cursor = ratingsCollection.find({});
            const result = await cursor.toArray();
            res.send(result);
        })
        // make admin
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            console.log('put', user)
            const filter = { email: user.email };
            // const options = { upsert: true };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        // get admin by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('serever running')
});

app.listen(port, () => {
    console.log('listening to port', port)
});