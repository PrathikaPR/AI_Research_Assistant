const generateSummary = (text) => {

    // Remove unwanted PowerPoint text
    const cleanedText = text
        .replace(/Click to edit Master title style/g, '')
        .replace(/\d+\/\d+\/\d+/g, '')
        .replace(/\n/g, ' ')
        .trim();

    // Split into sentences
    const sentences = cleanedText.split('.');

    // Take first meaningful sentences
    const summary = sentences
        .slice(0, 5)
        .join('.')
        .trim();

    return summary;

};


const extractKeywords = (text) => {

    const keywords = [];

    if (text.includes('Machine Learning')) {
        keywords.push('Machine Learning');
    }

    if (text.includes('Dark Web')) {
        keywords.push('Dark Web');
    }

    if (text.includes('Cyber')) {
        keywords.push('Cybersecurity');
    }

    if (text.includes('Threat')) {
        keywords.push('Threat Intelligence');
    }

    return keywords;

};


const detectDomain = (text) => {

    if (
        text.includes('Cyber') ||
        text.includes('Threat') ||
        text.includes('Dark Web')
    ) {

        return 'Cybersecurity';

    }

    return 'General Research';

};


module.exports = {
    generateSummary,
    extractKeywords,
    detectDomain
};