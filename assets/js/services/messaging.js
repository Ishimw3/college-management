// Twilio credentials
const TWILIO_ACCOUNT_SID = 'ACc95ed4b23f15d9ef7b1df1ca34b1b92a';
const TWILIO_AUTH_TOKEN = 'f1fb130e93a8c33f75edb94ee8630c76';
const TWILIO_PHONE_NUMBER = '+17854250457'; // Replace with your Twilio phone number

export class MessagingService {
    static async sendSMS(to, message) {
        try {
            const response = await fetch('https://api.twilio.com/2010-04-01/Accounts/' + TWILIO_ACCOUNT_SID + '/Messages.json', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(TWILIO_ACCOUNT_SID + ':' + TWILIO_AUTH_TOKEN)
                },
                body: new URLSearchParams({
                    'To': to,
                    'From': TWILIO_PHONE_NUMBER,
                    'Body': message
                })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }

    static sendWhatsApp(phoneNumber, message) {
        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    }
}
