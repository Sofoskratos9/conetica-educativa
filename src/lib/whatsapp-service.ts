// WhatsApp Integration Service
// Non-invasive, educational communication only

export interface WhatsAppMessage {
    type: 'confirmation' | 'reminder' | 'progress' | 'cta';
    recipient: string; // Phone number
    message: string;
    timestamp: string;
}

export interface WhatsAppTemplate {
    id: string;
    name: string;
    category: 'confirmation' | 'reminder' | 'progress' | 'cta';
    template: (data: any) => string;
}

// Your WhatsApp Business Number (to be configured)
export const WHATSAPP_BUSINESS_NUMBER = '5214491234567'; // Replace with actual number

// Message Templates
export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
    {
        id: 'booking_confirmation',
        name: 'Confirmación de Cita',
        category: 'confirmation',
        template: (data) => `¡Hola ${data.name}! 👋

Tu sesión de *${data.service}* ha sido confirmada.

📅 Fecha: ${data.date}
⏰ Hora: ${data.time}
📍 Modalidad: ${data.modality || 'Virtual'}

Te enviaremos un recordatorio 24h antes.

¿Tienes dudas? Responde este mensaje.

_Conética Educativa™_`
    },
    {
        id: 'reminder_24h',
        name: 'Recordatorio 24h',
        category: 'reminder',
        template: (data) => `Hola ${data.name} 🔔

Recordatorio: Mañana tienes tu sesión de *${data.service}*

⏰ ${data.time}
📍 ${data.link || 'Te enviaremos el enlace 1h antes'}

¿Necesitas reagendar? Avísanos con tiempo.

_Conética Educativa™_`
    },
    {
        id: 'progress_update',
        name: 'Actualización de Progreso',
        category: 'progress',
        template: (data) => `¡Felicidades ${data.name}! 🎉

Has completado *${data.modulesCompleted}/${data.totalModules} módulos*

📊 Tu promedio: ${data.averageScore}%
🔥 Racha actual: ${data.streak} días

${data.recommendation}

Sigue así, ¡vas muy bien! 💪

_Conética Educativa™_`
    },
    {
        id: 'session_cta',
        name: 'Invitación a Sesión',
        category: 'cta',
        template: (data) => `Hola ${data.name} 👋

Hemos notado que ${data.reason}

¿Te gustaría agendar una sesión 1:1 para:
${data.benefits}

Responde *SÍ* y te compartimos los horarios disponibles.

_Conética Educativa™_`
    }
];

// Generate WhatsApp Web URL
export function generateWhatsAppURL(phoneNumber: string, message: string): string {
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = phoneNumber.replace(/\D/g, ''); // Remove non-digits
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
}

// Generate WhatsApp Click-to-Chat URL (for business)
export function generateBusinessWhatsAppURL(message?: string): string {
    const encodedMessage = message ? encodeURIComponent(message) : '';
    return `https://wa.me/${WHATSAPP_BUSINESS_NUMBER}${message ? `?text=${encodedMessage}` : ''}`;
}

// Get template by ID
export function getWhatsAppTemplate(templateId: string): WhatsAppTemplate | undefined {
    return WHATSAPP_TEMPLATES.find(t => t.id === templateId);
}

// Send WhatsApp message (opens WhatsApp Web/App)
export function sendWhatsAppMessage(phoneNumber: string, message: string): void {
    const url = generateWhatsAppURL(phoneNumber, message);
    window.open(url, '_blank');
}

// Mock function to simulate sending automated message
// In production, this would integrate with WhatsApp Business API
export async function scheduleWhatsAppMessage(
    phoneNumber: string,
    templateId: string,
    data: any,
    sendAt?: Date
): Promise<{ success: boolean; messageId?: string }> {
    const template = getWhatsAppTemplate(templateId);

    if (!template) {
        return { success: false };
    }

    const message = template.template(data);

    // In production: Call WhatsApp Business API
    console.log('Scheduling WhatsApp message:', {
        to: phoneNumber,
        message,
        sendAt: sendAt || new Date()
    });

    return {
        success: true,
        messageId: `wa_${Math.random().toString(36).substr(2, 9)}`
    };
}
