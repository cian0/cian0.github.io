import base64
import logging
import json
import os
# Import WebClient from Python SDK (github.com/slackapi/python-slack-sdk)
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

from google.cloud import bigquery_datatransfer_v1

def hello_pubsub(event, context):
    """Triggered from a message on a Cloud Pub/Sub topic.
    Args:
         event (dict): Event payload.
         context (google.cloud.functions.Context): Metadata for the event.
    """
    pubsub_message = base64.b64decode(event['data']).decode('utf-8')
    print(pubsub_message)
    bq_params = json.loads(pubsub_message)

    # WebClient instantiates a client that can call API methods
    # When using Bolt, you can use either `app.client` or the `client` passed to listeners.
    client = WebClient(os.environ.get('SLACK_BOT_API_TOKEN'))
    logger = logging.getLogger(__name__)

    channel_id = "C0467MWG2G4"


    try:
        # Call the conversations.list method using the WebClient
        result = client.chat_postMessage(
            channel=channel_id,
            text=f"Bot works! {bq_params['dataSourceId']} {bq_params['state']} {bq_params['destinationDatasetId']} {bq_params['params']['destination_table_name_template']} "
            # You could also use a blocks[] array to send richer content
        )
        # Print result, which includes information about the message (like TS)
        print(result)

    except SlackApiError as e:
        print(f"Error: {e}")



def runQuery (parent, requested_run_time):
    client = bigquery_datatransfer_v1.DataTransferServiceClient()
    projectid = 'datawarehouse-336313' # Enter your projectID here
    transferid = ''  # Enter your transferId here
    parent = client.project_transfer_config_path(projectid, transferid)
    start_time = bigquery_datatransfer_v1.types.Timestamp(seconds=int(time.time() + 10))
    response = client.start_manual_transfer_runs(parent, requested_run_time=start_time)
    print(response)
    

    # run scheduled query
    # call cloud function 
    # export data