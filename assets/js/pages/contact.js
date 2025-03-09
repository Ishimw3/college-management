import { MessagingService } from '../services/messaging.js';

const stripe = Stripe('pk_test_51R02vnHHsxvbq3OYnA98ZDk0qrIrUdizv6ML3IuJmQwSqy1dpCOlNCBbMn1iOuLCaCkBcwNFGeYjzOO8jcwJV62v00B43t76eg');

class ContactManager {
    constructor() {
        this.initializeEventListeners();
        this.setupStripe();
        this.setupWhatsApp();
    }

    initializeEventListeners() {
        const contactForm = document.getElementById('contactForm');
        const paymentButtons = document.querySelectorAll('.btn-payment');

        contactForm?.addEventListener('submit', this.handleContactSubmit.bind(this));
        paymentButtons.forEach(button => {
            button.addEventListener('click', this.handlePaymentClick.bind(this));
        });
    }

    setupWhatsApp() {
        const whatsappButton = document.getElementById('whatsappButton');
        const whatsappNumber = document.getElementById('whatsappNumber');
        const whatsappMessage = document.getElementById('whatsappMessage');

        whatsappButton?.addEventListener('click', () => {
            if (!whatsappNumber.value) {
                this.showNotification('Veuillez entrer un numéro WhatsApp', 'error');
                return;
            }

            // Nettoyer le numéro (garder uniquement les chiffres et le +)
            const cleanNumber = whatsappNumber.value.replace(/[^\d+]/g, '');
            
            // Construire le message
            const message = whatsappMessage.value || 'Bonjour, je vous contacte depuis le système de gestion des collèges.';
            
            // Créer le lien WhatsApp
            const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
            
            // Ouvrir WhatsApp dans un nouvel onglet
            window.open(whatsappUrl, '_blank');
        });
    }

    setupStripe() {
        const elements = stripe.elements();
        this.card = elements.create('card');
        this.card.mount('#card-element');

        this.card.addEventListener('change', ({error}) => {
            const displayError = document.getElementById('card-errors');
            if (error) {
                displayError.textContent = error.message;
            } else {
                displayError.textContent = '';
            }
        });
    }

    async handleContactSubmit(e) {
        e.preventDefault();
        const form = e.target;
        const submitButton = form.querySelector('button[type="submit"]');
        
        try {
            submitButton.disabled = true;
            const formData = {
                name: form.querySelector('#name').value,
                email: form.querySelector('#email').value,
                phone: form.querySelector('#phone').value,
                message: form.querySelector('#message').value
            };

            // Envoi du message WhatsApp au développeur
            const developerPhone = '257xxxxxxxx'; // Remplacer par le numéro réel
            const whatsappMessage = `Nouveau message depuis College Management:\n
                Nom: ${formData.name}\n
                Email: ${formData.email}\n
                Téléphone: ${formData.phone}\n
                Message: ${formData.message}`;

            const whatsappUrl = `https://wa.me/${developerPhone}?text=${encodeURIComponent(whatsappMessage)}`;
            window.open(whatsappUrl, '_blank');

            // Réinitialiser le formulaire
            form.reset();
            this.showNotification('Message envoyé avec succès!', 'success');
        } catch (error) {
            console.error('Error sending message:', error);
            this.showNotification('Erreur lors de l\'envoi du message', 'error');
        } finally {
            submitButton.disabled = false;
        }
    }

    async handlePaymentClick(e) {
        const amount = e.target.dataset.amount;
        const paymentForm = document.getElementById('stripe-payment-form');
        paymentForm.classList.remove('hidden');

        try {
            const {paymentIntent} = await fetch('/create-payment-intent', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({amount})
            }).then(r => r.json());

            const result = await stripe.confirmCardPayment(paymentIntent.client_secret, {
                payment_method: {
                    card: this.card,
                }
            });

            if (result.error) {
                this.showNotification(result.error.message, 'error');
            } else {
                this.showNotification('Paiement effectué avec succès!', 'success');
                paymentForm.classList.add('hidden');
            }
        } catch (error) {
            console.error('Payment error:', error);
            this.showNotification('Erreur lors du paiement', 'error');
        }
    }

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ContactManager();
});

document.addEventListener('DOMContentLoaded', () => {
    const toggleButtons = document.querySelectorAll('.toggle-btn');
    const whatsappButton = document.getElementById('whatsappButton');
    const smsButton = document.getElementById('smsButton');
    const phoneInput = document.getElementById('phoneNumber');
    const messageInput = document.getElementById('messageText');

    // Toggle between WhatsApp and SMS
    toggleButtons.forEach(button => {
        button.addEventListener('click', () => {
            toggleButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const type = button.dataset.type;
            if (type === 'whatsapp') {
                whatsappButton.classList.remove('hidden');
                smsButton.classList.add('hidden');
            } else {
                whatsappButton.classList.add('hidden');
                smsButton.classList.remove('hidden');
            }
        });
    });

    // Handle WhatsApp send
    whatsappButton.addEventListener('click', () => {
        const phone = phoneInput.value;
        const message = messageInput.value;
        if (phone && message) {
            MessagingService.sendWhatsApp(phone, message);
        } else {
            alert('Veuillez remplir tous les champs');
        }
    });

    // Handle SMS send
    smsButton.addEventListener('click', async () => {
        const phone = phoneInput.value;
        const message = messageInput.value;
        if (phone && message) {
            try {
                await MessagingService.sendSMS(phone, message);
                alert('SMS envoyé avec succès!');
            } catch (error) {
                alert('Erreur lors de l\'envoi du SMS');
            }
        } else {
            alert('Veuillez remplir tous les champs');
        }
    });
});

document.addEventListener('DOMContentLoaded', () => {
    const phoneInput = document.querySelector('.phone-input');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const toggleBtns = document.querySelectorAll('.toggle-btn');

    toggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.target.dataset.type;
            
            // Show/hide phone input based on message type
            if (type === 'sms') {
                phoneInput.style.display = 'none';
                phoneNumberInput.value = '+25762072740';
            } else {
                phoneInput.style.display = 'block';
                phoneNumberInput.value = '';
            }

            // Update active button
            toggleBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Show/hide appropriate button
            document.getElementById('whatsappButton').classList.toggle('hidden', type === 'sms');
            document.getElementById('smsButton').classList.toggle('hidden', type === 'whatsapp');
        });
    });
});
