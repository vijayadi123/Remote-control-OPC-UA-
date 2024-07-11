const {
    OPCUAClient,
    MessageSecurityMode,
    SecurityPolicy,
    AttributeIds,
    resolveNodeId
} = require("node-opcua");

const prompt = require('prompt-sync')();

const connectionStrategy = {
    initialDelay: 1000,
    maxRetry: 1
};

const options = {
    applicationName: "MyClient",
    connectionStrategy: connectionStrategy,
    securityMode: MessageSecurityMode.Sign, 
    securityPolicy: SecurityPolicy.Basic256, 
    endpointMustExist: false,
};

const client = OPCUAClient.create(options);


const endpointUrl = "opc.tcp://" + prompt('Please enter the endpoint URL: ');
const username = prompt('Please enter the username: ');
const password = prompt('Please enter the password: ');

const safeConfigChangeDateNodeId = "ns=2;s=" + "/Axis/Drive/SAFE_CONFIG_CHANGE_DATE";


async function main() {
    try { 
        console.log("Connecting to OPC UA server...");
        await client.connect(endpointUrl);
        console.log("Connected!");

        const session = await client.createSession({
            userName: username,
            password: password
        });
        console.log(`Session created for user ${username}`);

        await readSafeConfigChangeDate(session);

        await session.close();
        console.log("Session closed");

        await client.disconnect();
        console.log("Disconnected");

    } catch (err) {
        console.error("An error has occurred:  ", err);
        console.log("Please verify your endpoint url , username and password  ", err);
    }
}

async function readSafeConfigChangeDate(session) {
    try {
        const nodeToRead = {
            nodeId: safeConfigChangeDateNodeId,
            attributeId: AttributeIds.Value
        };

        const dataValue = await session.read(nodeToRead, 0);
        if (dataValue.statusCode.name === "Good") {
            console.log(`Value of  (${safeConfigChangeDateNodeId}):`, dataValue.value.value);
        } else {
            console.error(`Error reading value: ${dataValue.statusCode.name}`);
        }
    } catch (error) {
        console.error(`Failed to read value of Safe_Config_Change_Date:`, error.message);
    }
}

main();
