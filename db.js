const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_DB_URL, {useNewUrlParser: true, useUnifiedTopology: true });

let db = mongoose.connection;
db.on('error', (err) => {
    console.error('Connection error:', err)
});
db.once('open', () => {
    console.log("Connected to mongodb.");
});
