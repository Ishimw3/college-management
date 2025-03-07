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
