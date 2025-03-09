exports.handler = function(context, event, callback) {
    // Set up response object
    const twiml = new Twilio.twiml.MessagingResponse();
    const response = new Twilio.Response();

    // Set CORS headers
    response.appendHeader('Access-Control-Allow-Origin', '*');
    response.appendHeader('Access-Control-Allow-Methods', 'OPTIONS, POST');
    response.appendHeader('Access-Control-Allow-Headers', 'Content-Type');
    response.appendHeader('Content-Type', 'application/json');

    // Log incoming request for debugging
    console.log('Received request:', event);

    // Handle OPTIONS request
    if (context.METHOD === 'OPTIONS') {
        return callback(null, response);
    }

    // Get Twilio client and verify phone number is set
    const client = context.getTwilioClient();
    const fromNumber = context.PHONE_NUMBER;

    if (!fromNumber) {
        console.error('Missing PHONE_NUMBER in environment variables');
        response.setStatusCode(500);
        response.setBody({ error: 'Server configuration error' });
        return callback(null, response);
    }

    // Verify required parameters and SMS number
    if (!event.to || !event.message) {
        console.error('Missing required parameters:', event);
        response.setStatusCode(400);
        response.setBody({ error: 'Missing required parameters' });
        return callback(null, response);
    }

    // Validate SMS recipient
    if (event.type === 'sms' && event.to !== '+25762072740') {
        console.error('Invalid SMS recipient');
        response.setStatusCode(403);
        response.setBody({ error: 'SMS messages can only be sent to the authorized number' });
        return callback(null, response);
    }

    // Send SMS
    client.messages
        .create({
            body: event.message,
            to: event.to,
            from: fromNumber
        })
        .then(message => {
            console.log('SMS sent successfully:', message.sid);
            response.setStatusCode(200);
            response.setBody({ 
                success: true, 
                sid: message.sid,
                message: 'SMS sent successfully'
            });
            return callback(null, response);
        })
        .catch(err => {
            console.error('Error sending SMS:', err);
            response.setStatusCode(500);
            response.setBody({ error: err.message });
            return callback(null, response);
        });
};