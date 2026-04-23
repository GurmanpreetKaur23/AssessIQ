import os
import smtplib
from email.mime.text import MIMEText


def send_registration_email(to_email: str, user_name: str):
  smtp_host = os.getenv("SMTP_HOST", "")
  smtp_port = int(os.getenv("SMTP_PORT", "587"))
  smtp_user = os.getenv("SMTP_USER", "")
  smtp_password = os.getenv("SMTP_PASSWORD", "")
  from_email = os.getenv("FROM_EMAIL", smtp_user or "no-reply@assessiq.local")
  subject = "Welcome to AssessIQ"
  body = (
    f"Hello {user_name},\n\n"
    "Your AssessIQ account has been created successfully.\n"
    "You can now sign in and start adaptive Olympiad assessment.\n\n"
    "Regards,\nAssessIQ Team"
  )
  if not smtp_host or not smtp_user or not smtp_password:
    return
  msg = MIMEText(body)
  msg["Subject"] = subject
  msg["From"] = from_email
  msg["To"] = to_email
  with smtplib.SMTP(smtp_host, smtp_port, timeout=20) as server:
    server.starttls()
    server.login(smtp_user, smtp_password)
    server.send_message(msg)
