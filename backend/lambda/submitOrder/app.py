import boto3
import json
import os
from datetime import datetime

# Initialize dynamodb resource
dynamodb = boto3.resource('dynamodb')
table_name = os.environ.get('TABLE_NAME') 
if not table_name:
    raise ValueError("Environment variable 'TABLE_NAME' is not set.")
table = dynamodb.Table(table_name)

# Lambda function handler
def handler(event, context):
    try:
        # Parse the request body
        request_body = json.loads(event['body'])
        customer_name = request_body.get('customer_name')
        items = request_body.get('items')
        timestamp = request_body.get('timestamp')
        delivery_date = request_body.get('delivery_date')

        if not customer_name or not items:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Invalid request body'})
            }
        
        # Generate a unique order ID
        order_id = f"order_{int(datetime.now().timestamp())}"

        # Put order details in DynamoDB
        table.put_item(
            Item={
                'OrderID': order_id,
                'CustomerName': customer_name,
                'Items': items,
                'Status': 'Pending',
                'Timestamp': timestamp,
                'DeliveryDate': delivery_date
            })
        
        # Return success response
        return {
            'statusCode': 200,
            'body': json.dumps({'message': 'Order submitted successfully',
            'orderNumber': order_id})
        }

    # Exception handling
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }