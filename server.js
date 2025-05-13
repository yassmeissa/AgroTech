// server.js
const express = require('express');
const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const serviceAccount = require('./newagent-f9uf-05968185e837.json'); // clé téléchargée

app.post('/chat', async (req, res) => {
  const { message } = req.body;
  const sessionId = uuid.v4();

  const sessionClient = new dialogflow.SessionsClient({
    credentials: {
      client_email: serviceAccount.client_email,
      private_key: serviceAccount.private_key,
    },
  });

  const sessionPath = sessionClient.projectAgentSessionPath(
    serviceAccount.project_id,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'fr',
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  const result = responses[0].queryResult;
  res.send({ reply: result.fulfillmentText });
});

app.listen(3000, () => {
  console.log('✅ Backend Dialogflow en écoute sur http://localhost:3000');
});