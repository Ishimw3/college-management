export class MessagingService {
    static async sendSMS(to, message) {
        try {
            const response = await fetch('https://c-man-4086.twil.io/send-sms', {
                method: 'POST',
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: to,
                    message: message
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to send SMS');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error sending SMS:', error);
            throw error;
        }
    }
}