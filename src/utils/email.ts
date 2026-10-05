import nodemailer from 'nodemailer';
import path from 'path';
import ejs from 'ejs';
import { ResponseService } from './response';

// Email configuration
const createTransporter = () => {
  // Check if we have valid email credentials
  const hasValidCredentials = process.env.EMAIL_USER && 
                             process.env.EMAIL_PASSWORD && 
                             process.env.EMAIL_PASSWORD !== 'your-gmail-app-password' &&
                             process.env.EMAIL_PASSWORD !== 'srk4cedrick';
  
  // For testing or when credentials are invalid, use test mode
  if (process.env.NODE_ENV === 'test' || !hasValidCredentials) {
    console.log('📧 Using TEST MODE - emails will be logged but not sent');
    return nodemailer.createTransport({
      host: 'localhost',
      port: 1025,
      secure: false,
      auth: {
        user: 'test',
        pass: 'test',
      },
    });
  }
  
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Email template configuration
const getTemplatePath = (templateName: string) => {
  return path.join(__dirname, '../templates', `${templateName}.ejs`);
};

// Send email function
export const sendEmail = async (
  to: string,
  subject: string,
  templateName: string,
  data: any = {}
): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const templatePath = getTemplatePath(templateName);
    
    // Render email template
    const html = await ejs.renderFile(templatePath, data);
    
    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to,
      subject,
      html: html as string,
    };
    
    // For testing without real email credentials, just log the email
    if (process.env.NODE_ENV === 'test' || !process.env.EMAIL_USER || 
        process.env.EMAIL_PASSWORD === 'your-gmail-app-password' ||
        process.env.EMAIL_PASSWORD === 'srk4cedrick') {
      console.log('📧 TEST EMAIL (not actually sent):');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('From:', process.env.EMAIL_USER || 'your-email@gmail.com');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('HTML Content:');
      console.log(html as string);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email would be sent in production with valid Gmail credentials');
      return true;
    }
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email sent successfully:', info.messageId);
    return true;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    return false;
  }
};

// Send subscription confirmation email
export const sendSubscriptionConfirmation = async (email: string, subscriberData: any) => {
  const subject = 'Welcome to Our Newsletter! 🎉';
  const templateData = {
    email,
    subscribedAt: subscriberData.subscribedAt,
    unsubscribeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?email=${email}`,
    companyName: 'Blog API',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@blogapi.com',
  };
  
  return await sendEmail(email, subject, 'subscription-confirmation', templateData);
};

// Send new blog notification email
export const sendNewBlogNotification = async (subscriberEmail: string, blogData: any) => {
  const subject = `New Blog Post: ${blogData.title}`;
  const templateData = {
    subscriberEmail,
    blogTitle: blogData.title,
    blogDescription: blogData.description,
    blogUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/blog/${blogData.id}`,
    companyName: 'Blog API',
    unsubscribeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/unsubscribe?email=${subscriberEmail}`,
  };
  
  return await sendEmail(subscriberEmail, subject, 'new-blog-notification', templateData);
};

// Send unsubscribe confirmation email
export const sendUnsubscribeConfirmation = async (email: string) => {
  const subject = 'You have been unsubscribed';
  const templateData = {
    email,
    companyName: 'Blog API',
    resubscribeUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscribe?email=${email}`,
  };
  
  return await sendEmail(email, subject, 'unsubscribe-confirmation', templateData);
}; 