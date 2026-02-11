import ServicePageTemplate from './ServicePageTemplate';

export default function ComprehensiveCare() {
    return (
        <ServicePageTemplate
            title="Comprehensive Cardiac Care"
            description="Holistic heart health management tailored to your unique physiology."
            imageSrc="/assets/images/Comprehensive Care.jpg"
            benefits={[
                "Full spectrum cardiovascular assessment",
                "Personalized treatment plans utilizing AI insights",
                "Integration with wearable health devices",
                "24/7 Access to care team support"
            ]}
            detailedContent="Our Comprehensive Care program is designed to provide you with a 360-degree view of your heart health. Unlike traditional reactive medicine, we focus on proactive management and prevention. By combining state-of-the-art diagnostic imaging with genetic screening and lifestyle analysis, we build a complete profile of your cardiovascular risk factors. This allows our specialists to catch potential issues years before they become symptomatic."
        />
    );
}
