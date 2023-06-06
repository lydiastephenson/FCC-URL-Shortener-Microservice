require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const urlparser = require('url');

// Basic Configuration
const port = process.env.PORT || 3000;
mongoose.connect(process.env.MONGO_URI, { useUnifiedTopology: true, useNewUrlParser: true });
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

/* ====== SOLUTION ====== */

const urlSchema = new mongoose.Schema({
  original_url: String,
});

const URL = mongoose.model("Url", urlSchema);

app.post('/api/shorturl', (req, res) => {
  const original_url = req.body.url;
  dns.lookup(urlparser.parse(original_url).hostname, (err, address) => {
    if (err || address == null) {
      return res.json({ error: 'invalid url' });
    } else {
      let url = new URL({ original_url: original_url });
      url.save().then(() => {
        res.json({ original_url: original_url, short_url: url._id });
      }).catch((err) => {
        console.log(err);
      });
    }
  });
});

app.get('/api/shorturl/:shorturl', (req, res) => {
  URL.findById({ _id: req.params.shorturl }).then((data) => {
    res.redirect(data.original_url);
  }).catch((err) => {
    console.log(err);
    res.json({ error: 'invalid url' });
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
