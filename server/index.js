const express = require('express');
const app = express();
const port = 3003;

const bodyParser = require('body-parser');
app.use(bodyParser.json());

const db = require('./database');

const path = require('path');
app.use('/', express.static(path.join(__dirname, '..', 'client', 'dist')));

app.get('/api/:id', (req, res) => {
  db.readSequence(req.params.id)
    .then((result) => {
      res.status(200).json(result);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).end(`There was an error whilst fetching seqence ${req.params.id}: ${err}`);
    });
});

app.get('/browse', (req, res) => {
  db.getAll()
    .then((results) => {
      let returnDoc = `
        <!DOCTYPE html>
        <body>
        <a href="/">Back</a>
        <table>
          <tr>
            <th>
              ID
            </th>
            <th>
              Author
            </th>
            <th>
              Title
            </th>
          </tr>
      `;
      for (let entry of results) {
        returnDoc += `<tr>
          <td>
            ${entry.id}
          </td>
          <td>
            ${entry.author}
          </td>
          <td>
            <a href="/?sid=${entry.id}">
              ${entry.title}
            </a>
          </td>
        </tr>`;
      }
      returnDoc += `
      </table>
      </body>
      `;
      res.status(200).end(returnDoc);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).end(`There was an error whilst fetching sequences: ${err}`);
    });
});

app.post('/create', (req, res) => {
  const { seq, author, title } = req.body;
  if ( seq && author && title ) {
    db.writeSequence(seq, author, title)
      .then((id) => {
        res.status(201).end(id.toString());
      })
      .catch((err) => {
        console.error(err);
        res.status(500).end(`There was an error whilst fetching seqence ${req.params.id}: ${err}`);
      });
  } else {
    res.sendStatus(422);
  }
});

app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});