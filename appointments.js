// Appointment Management System
class AppointmentManager {
    constructor() {
        this.appointments = [];
        this.availableTimes = {
            morning: ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30'],
            afternoon: ['16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30']
        };
        this.services = {
            'blood-pressure': 'Medición de Presión Arterial',
            'nutrition': 'Consulta Nutricional',
            'consultation': 'Consulta General'
        };
        this.init();
    }
    
    init() {
        this.loadAppointmentsFromStorage();
        this.setupEventListeners();
        this.setMinDate();
    }
    
    setupEventListeners() {
        // Close modal when clicking outside
        const appointmentModal = document.getElementById('appointment-modal');
        if (appointmentModal) {
            appointmentModal.addEventListener('click', (e) => {
                if (e.target === appointmentModal) {
                    this.closeAppointmentModal();
                }
            });
        }
    }
    
    setMinDate() {
        const dateInput = document.getElementById('appointment-date');
        if (dateInput) {
            // Set minimum date to tomorrow
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.min = tomorrow.toISOString().split('T')[0];
            
            // Set maximum date to 30 days from now
            const maxDate = new Date();
            maxDate.setDate(maxDate.getDate() + 30);
            dateInput.max = maxDate.toISOString().split('T')[0];
        }
    }
    
    openAppointmentModal(serviceType = '') {
        const modal = document.getElementById('appointment-modal');
        const serviceSelect = document.getElementById('appointment-service');
        
        if (modal) {
            modal.classList.add('active');
            
            // Pre-select service if provided
            if (serviceType && serviceSelect) {
                serviceSelect.value = serviceType;
            }
            
            // Clear form
            this.clearForm();
        }
    }
    
    closeAppointmentModal() {
        const modal = document.getElementById('appointment-modal');
        if (modal) {
            modal.classList.remove('active');
            this.clearForm();
        }
    }
    
    clearForm() {
        const form = document.getElementById('appointment-form');
        if (form) {
            form.reset();
            this.updateAvailableTimes();
        }
    }
    
    updateAvailableTimes() {
        const dateInput = document.getElementById('appointment-date');
        const timeSelect = document.getElementById('appointment-time');
        
        if (!dateInput || !timeSelect || !dateInput.value) {
            timeSelect.innerHTML = '<option value="" data-translate="select_time">Seleccionar hora</option>';
            return;
        }
        
        const selectedDate = dateInput.value;
        const bookedTimes = this.getBookedTimesForDate(selectedDate);
        
        // Combine all available times
        const allTimes = [...this.availableTimes.morning, ...this.availableTimes.afternoon];
        
        // Filter out booked times
        const availableTimes = allTimes.filter(time => !bookedTimes.includes(time));
        
        // Generate options
        let optionsHTML = '<option value="" data-translate="select_time">Seleccionar hora</option>';
        
        if (this.availableTimes.morning.some(time => availableTimes.includes(time))) {
            optionsHTML += '<optgroup label="Mañana">';
            this.availableTimes.morning.forEach(time => {
                if (availableTimes.includes(time)) {
                    optionsHTML += `<option value="${time}">${time}</option>`;
                }
            });
            optionsHTML += '</optgroup>';
        }
        
        if (this.availableTimes.afternoon.some(time => availableTimes.includes(time))) {
            optionsHTML += '<optgroup label="Tarde">';
            this.availableTimes.afternoon.forEach(time => {
                if (availableTimes.includes(time)) {
                    optionsHTML += `<option value="${time}">${time}</option>`;
                }
            });
            optionsHTML += '</optgroup>';
        }
        
        timeSelect.innerHTML = optionsHTML;
    }
    
    getBookedTimesForDate(date) {
        return this.appointments
            .filter(appointment => appointment.date === date)
            .map(appointment => appointment.time);
    }
    
    submitAppointment() {
        const form = document.getElementById('appointment-form');
        if (!form) return;
        
        // Get form data
        const formData = {
            service: document.getElementById('appointment-service').value,
            date: document.getElementById('appointment-date').value,
            time: document.getElementById('appointment-time').value,
            name: document.getElementById('appointment-name').value,
            phone: document.getElementById('appointment-phone').value,
            email: document.getElementById('appointment-email').value,
            notes: document.getElementById('appointment-notes').value
        };
        
        // Validate required fields
        if (!formData.service || !formData.date || !formData.time || 
            !formData.name || !formData.phone || !formData.email) {
            this.showNotification('Por favor, completa todos los campos obligatorios', 'error');
            return;
        }
        
        // Validate email format
        if (!this.isValidEmail(formData.email)) {
            this.showNotification('Por favor, introduce un email válido', 'error');
            return;
        }
        
        // Check if time slot is still available
        const bookedTimes = this.getBookedTimesForDate(formData.date);
        if (bookedTimes.includes(formData.time)) {
            this.showNotification('Lo sentimos, esa hora ya no está disponible', 'error');
            this.updateAvailableTimes();
            return;
        }
        
        // Create appointment object
        const appointment = {
            id: Date.now(),
            ...formData,
            serviceName: this.services[formData.service],
            status: 'confirmed',
            createdAt: new Date().toISOString()
        };
        
        // Add to appointments array
        this.appointments.push(appointment);
        
        // Save to storage
        this.saveAppointmentsToStorage();
        
        // Show success message
        this.showNotification('¡Cita reservada con éxito! Te enviaremos una confirmación por email.', 'success');
        
        // Close modal
        this.closeAppointmentModal();
        
        // Send confirmation email (simulated)
        this.sendConfirmationEmail(appointment);
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    sendConfirmationEmail(appointment) {
        // In a real implementation, this would send an actual email
        console.log('Sending confirmation email for appointment:', appointment);
        
        // Simulate email sending delay
        setTimeout(() => {
            console.log(`Confirmation email sent to ${appointment.email}`);
        }, 1000);
    }
    
    cancelAppointment(appointmentId) {
        const appointmentIndex = this.appointments.findIndex(apt => apt.id === appointmentId);
        if (appointmentIndex !== -1) {
            this.appointments.splice(appointmentIndex, 1);
            this.saveAppointmentsToStorage();
            this.showNotification('Cita cancelada correctamente', 'success');
        }
    }
    
    getUpcomingAppointments() {
        const today = new Date().toISOString().split('T')[0];
        return this.appointments
            .filter(apt => apt.date >= today && apt.status === 'confirmed')
            .sort((a, b) => new Date(a.date + ' ' + a.time) - new Date(b.date + ' ' + b.time));
    }
    
    saveAppointmentsToStorage() {
        try {
            localStorage.setItem('pharmacy_appointments', JSON.stringify(this.appointments));
        } catch (error) {
            console.warn('Could not save appointments to localStorage:', error);
        }
    }
    
    loadAppointmentsFromStorage() {
        try {
            const savedAppointments = localStorage.getItem('pharmacy_appointments');
            if (savedAppointments) {
                this.appointments = JSON.parse(savedAppointments);
            }
        } catch (error) {
            console.warn('Could not load appointments from localStorage:', error);
            this.appointments = [];
        }
    }
    
    showNotification(message, type = 'success') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
        notification.innerHTML = `
            <i class="${icon}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove notification after 4 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }
}

// Global function to open appointment modal
function openAppointmentModal(serviceType = '') {
    if (window.appointmentManager) {
        window.appointmentManager.openAppointmentModal(serviceType);
    }
}

// Initialize appointment manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.appointmentManager = new AppointmentManager();
});
