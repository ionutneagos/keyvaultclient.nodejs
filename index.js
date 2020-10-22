const express = require('express');
const { DefaultAzureCredential } = require("@azure/identity");
const { SecretClient } = require("@azure/keyvault-secrets");

require('dotenv').config();

const KEY_VAULT_URL = null || process.env['KEY_VAULT_URL'];

let app = express();

const credential = new DefaultAzureCredential();
const client = new SecretClient(KEY_VAULT_URL, credential);


async function listSecrets() {
    for await (let secretProperties of client.listPropertiesOfSecrets()) {
        console.log("Secret properties: ", secretProperties);
    }
}

async function getSecret(secretName) {
    const latestSecret = await client.getSecret(secretName);
    console.log(`Latest version of the secret ${secretName}: `, latestSecret);
    console.log(`Secret vaue for ${secretName}: `, latestSecret.value);
    let version = latestSecret.properties ? latestSecret.properties.version : '';
    const specificSecret = await client.getSecret(secretName, { version: version });
    console.log(`The secret ${secretName} at the version ${version}: `, specificSecret);
    return latestSecret.value;
}

app.get('/', async function (req, res) {
    //await listSecrets();
    const secretValue = await getSecret('SqlServer');
    res.send(`Your value for SqlServer secret is: ${secretValue}.`);
});

let port = process.env.PORT || 3000;

app.listen(port, function () {
    console.log(`Server running at http://localhost:${port}`);
});