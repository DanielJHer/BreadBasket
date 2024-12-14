import boto3
import json
import os
import datetime from datetime

# Initialize dynamodb resource
dynamodb = boto3.resource('dynamodb')
tableName = os.environ.get('TABLE_NAME')
table = dynamodb.Table(tableName)

# Lambda function handler
def handler(event, context):
    try:
        # Parse the request body
        request_body = json.loads(event['body'])
        customer_name = body.get('customer_Name')
        items = body.get('items')

        if not customer_name or not items:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid request body'})
            }
        
        # Generate a unique order ID
        order_id = f"order_{int(datetime.now().timestamp())}"
        timestamp = datetime.utnow().isoformat()

        # Put order details in DynamoDB
        table.put_item(
            Item={
                'Order_ID': order_id,
                'CustomerName': customer_name,
                'Items': items,
                'Status': 'Pending',
                'Timestamp': timestamp,
            })
        
        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Order submitted successfully'})
        }

    # Exception handling
    except as Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }