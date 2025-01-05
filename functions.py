import boto3
from botocore.exceptions import ClientError
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
import os


#
def send_resume_email(recipient_email):
    attachment = '/home/ubuntu/ah/static/downloads/Alex Haas resume.pdf'
    #attachment = 'C:\\Users\\liste\PycharmProjects\\alex-haas\\static\\downloads\\Alex Haas resume.pdf'
    aws_id = 'AKIA23CE4INOONHLTRMW'
    aws_pass = 'aSm7e8Zvl4iGk1aChMJAJ90yM5bPanx0mYP7uGE1'
    aws_region = 'us-east-1'
    charset = 'utf-8'
    html_only = """<html>
    <body>
    Hello!<br>
    Thank you for requesting my resume. It should be attached to this email.
    </body>
    </html>
    """
    sender_email = 'alex@alex-haas.com'
    subject = "Alex Haas's resume"
    text_only = 'Hello!\n\nThank you for requesting my resume. It should be attached to this email. STUFF HERE'

    # ses = boto3.client(
    #     'ses',
    #     region_name=SES_REGION_NAME,
    #     aws_access_key_id=AWS_ACCESS_KEY_ID,
    #     aws_secret_access_key=AWS_SECRET_ACCESS_KEY
    # )
    boto_client = boto3.client('ses', aws_access_key_id=aws_id, aws_secret_access_key=aws_pass, region_name=aws_region)
    message = MIMEMultipart('mixed')
    message['Subject'] = subject
    message['From'] = sender_email
    message['To'] = recipient_email

    html_version = MIMEText(html_only.encode(charset), 'html', charset)
    text_version = MIMEText(text_only.encode(charset), 'plain', charset)
    message_body = MIMEMultipart('alternative')
    message_body.attach(html_version)
    message_body.attach(text_version)

    email_attachment = MIMEApplication(open(attachment, 'rb').read())

    email_attachment.add_header('Content-Disposition', 'attachment', filename=os.path.basename(attachment))

    message.attach(message_body)
    message.attach(email_attachment)

    try:
        response = boto_client.send_raw_email(
            Source=sender_email,
            Destinations=[recipient_email],
            RawMessage={'Data':message.as_string()}
        )
    except ClientError as e:
        print(e.response['Error']['Message'])

    print('script got to this point before the return')
    return recipient_email
