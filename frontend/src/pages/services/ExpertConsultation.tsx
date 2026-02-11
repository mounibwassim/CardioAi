import ServicePageTemplate from './ServicePageTemplate';

export default function ExpertConsultation() {
    return (
        <ServicePageTemplate
            title="Expert Specialist Consultation"
            description="World-class cardiologists at your service, in-person or virtual."
            imageSrc="/assets/images/consultation.webp"
            benefits={[
                "Access to top-tier board-certified cardiologists",
                "Virtual consultations for your convenience",
                "Second opinion services for complex cases",
                "Multidisciplinary team approach"
            ]}
            detailedContent="Technology is powerful, but nothing replaces the human touch of a master clinician. At CardioAI, our technology serves to enhance our specialists, not replace them. Our team consists of leading experts in interventional cardiology, electrophysiology, and preventative medicine. Whether you are facing a new diagnosis or seeking to optimize your performance, our experts take the time to listen, understand, and guide you towards your best health."
        />
    );
}
