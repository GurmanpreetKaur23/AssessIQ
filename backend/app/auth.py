import os
from datetime import datetime,timedelta
from passlib.context import CryptContext
from jose import jwt
import boto3
pwd_context=CryptContext(schemes=["bcrypt"],deprecated="auto")
SECRET_KEY=os.getenv("SECRET_KEY","supersecret")
ALGORITHM="HS256"
ACCESS_TOKEN_EXPIRE_MINUTES=60*24*7
def verify_password(plain,password):
    return pwd_context.verify(plain,password)
def get_password_hash(password):
    return pwd_context.hash(password)
def create_access_token(data,expires_delta=None):
    to_encode=data.copy()
    if expires_delta:
        expire=datetime.utcnow()+expires_delta
    else:
        expire=datetime.utcnow()+timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp":expire})
    encoded_jwt=jwt.encode(to_encode,SECRET_KEY,algorithm=ALGORITHM)
    return encoded_jwt
def send_sns_email(subject,message,email):
    region=os.getenv("AWS_REGION","us-east-1")
    sns=boto3.client("sns",region_name=region)
    topic_arn=os.getenv("SNS_TOPIC_ARN")
    if topic_arn:
        sns.publish(TopicArn=topic_arn,Subject=subject,Message=message)
    else:
        sns.publish(TopicArn=f"arn:aws:sns:{region}:{os.getenv('AWS_ACCOUNT_ID','000000000000')}:AssessIQNotifications",Subject=subject,Message=message)
