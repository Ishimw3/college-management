export class MessagingService {
    static async sendSMS(to, message) {
        try {
            const response = await fetch('https://c-man-4086.twil.io/send-sms', {
                method: 'POST',
                mode: 'cors', // Added for CORS support
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to,
                    message
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText);
            }

            const data = await response.json();
            console.log('SMS Response:', data);

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