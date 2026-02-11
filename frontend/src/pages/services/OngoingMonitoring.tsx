import ServicePageTemplate from './ServicePageTemplate';

export default function OngoingMonitoring() {
    return (
        <ServicePageTemplate
            title="Continuous Health Monitoring"
            description="Stay ahead of your health with 24/7 remote monitoring."
            imageSrc="/assets/images/monitoring.webp"
            benefits={[
                "Real-time integration with smartwatches & medical devices",
                "Alerts for abnormal heart rate or rhythm",
                "Monthly detailed health reports",
                "Priority scheduling is anomalies are detected"
            ]}
            detailedContent="Heart health doesn't stop when you leave the clinic. Our Ongoing Monitoring service ensures you are protected around the clock. By connecting seamlessly with standard wearable devices or prescribed medical monitors, our system continuously tracks your vital signs. Our AI watchdog scans this stream for irregularities, alerting you and your care team immediately if potential issues arise, giving you peace of mind to live your life fully."
        />
    );
}
