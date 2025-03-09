const TWILIO_PHONE_NUMBER = '+17854250457';

export class MessagingService {
    static async sendSMS(to, message) {
        try {
            // Replace YOUR_TWILIO_FUNCTION_URL with your actual Twilio Function URL
            const response = await fetch('https://c-man-4086.twil.io/send-sms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to,
                    message
                })
            });

            const data = await response.json();
            console.log('SMS Response:', data);
            
            if (!response.ok) {
                throw new Error(data.error || 'Failed to send SMS');
            }

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
