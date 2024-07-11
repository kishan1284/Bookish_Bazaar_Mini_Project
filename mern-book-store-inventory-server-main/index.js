const express = require('express')
const app = express();
const cors = require('cors')
const port = process.env.PORT || 5000;
const stripe= require('stripe')('sk_test_51PCegjSBS6VjnK9nGGMv760n8rA4Drh04Ng0vfufSuhnoN33fiy3H7rxNszxljfvmxPyjWAMz52EDsSAX8g1csT000SAilPL2b')


const uuid = require('uuid');

// middlewear 
app.use(cors());
app.use(express.json());
app.get('/', (req, res) => {
    res.send('Hello World!')
})
// mongodb confiq here
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://Maulik1811:Maulikpanchal1811@atlascluster.pcy28ir.mongodb.net/?retryWrites=true&w=majority&appName=AtlasCluster";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
}); 

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        // Send a ping to confirm a successful connection
        const bookCollections = client.db("BookInventory").collection("Books");
        
        // insert a book to db: Post Method
        app.post("/upload-book", async (req, res) => {
            const data = req.body;
            // console.log(data);
            const result = await bookCollections.insertOne(data);
            res.send(result);
        })

        // get all books from db
        app.get("/all-books", async (req, res) => {
            const books = bookCollections.find();
            const result = await books.toArray();
            res.send(result)
        })

        // get all books & find by a category from db
        app.get("/all-books", async (req, res) => {
            let query = {};
            if (req.query?.category) {
                query = { category: req.query.category }
            }
            const result = await bookCollections.find(query).toArray();
            res.send(result)
        })

        // update a books method
        app.patch("/book/:id", async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const updateBookData = req.body;
            const filter = { _id: new ObjectId(id) };
            const updatedDoc = {
                $set: {
                    ...updateBookData
                }
            }
            const options = { upsert: true };

            // update now
            const result = await bookCollections.updateOne(filter, updatedDoc, options);
            res.send(result);
        })


        // delete a item from db
        app.delete("/book/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await bookCollections.deleteOne(filter);
            res.send(result);
        })


        // get a single book data
        app.get("/book/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await bookCollections.findOne(filter);
            res.send(result)
        })
const uuid = require('uuid'); // Import uuid library
app.post('/payment', (req, res) => {
    const { book, token } = req.body;
    console.log('book', book);
    console.log('price', book.price);
    const idempotencyKey = uuid.v4(); // Generate idempotency key
    return stripe.customers.create({
        email: token.email,
        source: token.id
    }).then(customer => {
        return stripe.charges.create({
            amount: book.price * 100, // Convert amount to smallest currency unit
            currency: 'inr',
            customer: customer.id,
            description: book.name,
        }, { idempotency_key: idempotencyKey }); // Use correct idempotency key parameter name
    }).then(result => res.status(200).json(result))
    .catch(err => {
        console.error(err); // Log error for better debugging
        res.status(500).json({ error: 'An error occurred while processing the payment' }); // Send meaningful error response
    });
});


        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})