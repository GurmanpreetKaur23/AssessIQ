import boto3
import os
from botocore.exceptions import ClientError
from typing import Optional
def upload_fileobj(fileobj, bucket, key):
    s3=boto3.client("s3")
    s3.upload_fileobj(fileobj,bucket,key)
    return f"s3://{bucket}/{key}"
def generate_presigned_url(bucket,key,expires_in=3600):
    s3=boto3.client("s3")
    try:
        url=s3.generate_presigned_url('get_object',Params={'Bucket':bucket,'Key':key},ExpiresIn=expires_in)
        return url
    except ClientError:
        return None
