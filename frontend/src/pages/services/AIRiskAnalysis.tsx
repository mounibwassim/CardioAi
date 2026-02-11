import ServicePageTemplate from './ServicePageTemplate';

export default function AIRiskAnalysis() {
    return (
        <ServicePageTemplate
            title="AI-Powered Risk Analysis"
            description="Next-generation predictive analytics for early detection."
            imageSrc="/assets/images/AI Risk Analysis.jpg"
            benefits={[
                "Machine Learning prediction with 85%+ accuracy",
                "Instant processing of clinical markers",
                "Comparative analysis against global health datasets",
                "Risk stratification for focused intervention"
            ]}
            detailedContent="Harness the power of Artificial Intelligence to protect your heart. Our proprietary AI algorithms analyze thousands of data points - from your blood pressure trends and cholesterol levels to family history and lifestyle factors. This deep learning approach identifies subtle patterns that human analysis might miss, providing you with a highly accurate risk assessment score. This isn't just data; it's a roadmap to your future health."
        />
    );
}
