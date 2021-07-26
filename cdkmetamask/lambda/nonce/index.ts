import * as AWS from'aws-sdk';
const dynamo = new AWS.DynamoDB();
var documentClient = new AWS.DynamoDB.DocumentClient();

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Credentials': true,
};
module.exports.handler = async (event: any, context: any, callback: any) => {
    const {
        queryStringParameters: { address },
    } = event;

    try {
        const nonces: any = await getNonce(address);
        console.log("nonces ", nonces)
        if (nonces.Item.nonce) {
            // const new_nonce = AWS.DynamoDB.Converter.unmarshall(nonces.Item);
            // console.log("new_nonce", new_nonce)
            return {
                headers,
                statusCode: 200,
                body: JSON.stringify(nonces.Item),
            };
        }
        return {
            headers,
            statusCode: 404,
            body: JSON.stringify({
                nonce: null,
            }),
        };
    } catch (error) {
        return callback(error, null);
    }
};

const getNonce = (address: string) => {
    var params: any = {
        TableName : process.env.USER_TABLE,
        Key: {
            address
        }
    };
    return documentClient.get(params).promise();
};