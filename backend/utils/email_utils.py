"""
Email utility functions for the SADP application.
"""
import os
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

logger = logging.getLogger(__name__)

def send_email(to_email, subject, html_content, text_content=None):
    """
    Send an email using the configured SMTP server.
    
    Args:
        to_email (str): Recipient email address
        subject (str): Email subject
        html_content (str): HTML content of the email
        text_content (str, optional): Plain text content of the email
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    from_email = os.environ.get('SMTP_USERNAME', 'noreply@sadp.local')
    smtp_server = os.environ.get('SMTP_SERVER', 'localhost')
    smtp_port = int(os.environ.get('SMTP_PORT', 25))
    smtp_username = os.environ.get('SMTP_USERNAME', '')
    smtp_password = os.environ.get('SMTP_PASSWORD', '')
    use_tls = os.environ.get('SMTP_USE_TLS', 'false').lower() == 'true'
    
    # Configure email message
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = from_email
    msg['To'] = to_email

    # Add plain text version if provided, otherwise create simple version from HTML
    if text_content is None:
        text_content = f"Please view this email in an HTML compatible email client.\n\n{html_content}"
    
    msg.attach(MIMEText(text_content, 'plain'))
    msg.attach(MIMEText(html_content, 'html'))
    
    # Send the email
    try:
        if os.environ.get('APP_ENV', 'development') == 'development':
            logger.info(f"[DEV MODE] Would send email to {to_email}: {subject}")
            logger.debug(f"Email content: {html_content}")
            return True
            
        # Connect to SMTP server
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            if use_tls:
                server.starttls()
            
            # Login if credentials provided
            if smtp_username and smtp_password:
                server.login(smtp_username, smtp_password)
            
            # Send email
            server.sendmail(from_email, to_email, msg.as_string())
            
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        return False

def send_password_reset_email(user, token):
    """
    Send a password reset email to a user.
    
    Args:
        user: User object with email and other attributes
        token (str): Password reset token
        
    Returns:
        bool: True if email was sent successfully, False otherwise
    """
    # Get the base URL from environment or use default
    base_url = os.environ.get('FRONTEND_URL', 'http://localhost:3000')
    reset_url = f"{base_url}/reset-password?token={token}"
    
    subject = "Password Reset Request - Secure Application Demo Platform"
    
    html_content = f"""
    <html>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #008080; border-bottom: 1px solid #eee; padding-bottom: 10px;">Password Reset Request</h2>
        <p>Hello {user.first_name or user.username},</p>
        <p>We received a request to reset your password for your Secure Application Demo Platform account.</p>
        <p>To reset your password, please click the button below:</p>
        <p style="text-align: center;">
            <a href="{reset_url}" 
               style="background-color: #008080; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">
               Reset Password
            </a>
        </p>
        <p>If you did not request this password reset, please ignore this email or contact support.</p>
        <p>This link will expire in 30 minutes for security reasons.</p>
        <p>Thank you,<br>The SADP Team</p>
        <div style="font-size: 12px; color: #666; margin-top: 30px; border-top: 1px solid #eee; padding-top: 10px;">
            <p>This is an automated message from the Secure Application Demo Platform. Please do not reply to this email.</p>
        </div>
    </body>
    </html>
    """
    
    text_content = f"""
    Password Reset Request - Secure Application Demo Platform
    
    Hello {user.first_name or user.username},
    
    We received a request to reset your password for your Secure Application Demo Platform account.
    
    To reset your password, please visit this link:
    {reset_url}
    
    If you did not request this password reset, please ignore this email or contact support.
    This link will expire in 30 minutes for security reasons.
    
    Thank you,
    The SADP Team
    
    This is an automated message. Please do not reply to this email.
    """
    
    return send_email(user.email, subject, html_content, text_content)
