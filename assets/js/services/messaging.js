// Twilio credentials
const TWILIO_ACCOUNT_SID = 'AC9a93011daf5337b282e298216aa53929';
const TWILIO_AUTH_TOKEN = 'fba576c39333156998611b96a47b02df';
const TWILIO_PHONE_NUMBER = '+17854250457';

export class MessagingService {
    static async sendSMS(to, message) {
        try {
            const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
            const formData = new URLSearchParams();
            formData.append('To', to);
            formData.append('From', TWILIO_PHONE_NUMBER);
            formData.append('Body', message);

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Basic ' + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
                },
                body: formData
            });

            const data = await response.json();

            if (response.status !== 201) {
                throw new Error(data.message || 'Failed to send SMS');
            }

            console.log('SMS sent successfully:', data);
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
