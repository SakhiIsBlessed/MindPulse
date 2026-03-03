const { Op } = require('sequelize');
const JournalEntry = require('../models/JournalEntry');
const EmergencyContact = require('../models/EmergencyContact');
const EmergencyAlert = require('../models/EmergencyAlert');
const User = require('../models/User');
const { sendEmergencyAlertEmail } = require('./emailService');

/**
 * Analyzes the user's recent wellness trends and determines if an alert should be triggered.
 * Follows ethical, consent-based logic.
 * @param {number} userId - The ID of the user to analyze.
 * @returns {Promise<Object>} - Action to be taken: { action: 'NONE' | 'REQUEST_CONSENT' | 'AUTO_SENT', reason: string }
 */
const analyzeWellnessTrend = async (userId) => {
  try {
    // 1. Fetch User and check if alerts are enabled
    const user = await User.findByPk(userId);
    if (!user || !user.emergency_alert_enabled) {
      return { action: 'NONE', reason: 'Alerts disabled by user.' };
    }

    // 2. Fetch Verified Emergency Contact
    const contact = await EmergencyContact.findOne({ where: { user_id: userId, email_verified: true } });
    if (!contact) {
      return { action: 'NONE', reason: 'No verified emergency contact found.' };
    }

    // 3. Check Cooldown (7 days)
    const cooldownPeriod = 7 * 24 * 60 * 60 * 1000;
    const lastAlert = await EmergencyAlert.findOne({
      where: {
        user_id: userId,
        createdAt: { [Op.gt]: new Date(Date.now() - cooldownPeriod) }
      }
    });

    const isTestMode = process.env.TEST_EMERGENCY_MODE === "true";
    if (lastAlert && !isTestMode) {
      return { action: 'NONE', reason: 'Cooldown active.' };
    }

    // 4. Fetch Last 7 Days (or 3 for dev/testing)
    const DAYS_TO_CHECK = isTestMode ? 3 : 7;
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - DAYS_TO_CHECK);

    const recentEntries = await JournalEntry.findAll({
      where: {
        user_id: userId,
        createdAt: { [Op.gte]: dateThreshold }
      },
      order: [['createdAt', 'DESC']]
    });

    if (recentEntries.length === 0) {
      return { action: 'NONE', reason: 'No recent entries found.' };
    }

    // 5. Evaluate Risk
    const latestEntry = recentEntries[0];
    const avgMood = recentEntries.reduce((sum, e) => sum + e.mood_score, 0) / recentEntries.length;
    
    // Level 2: Critical Risk (Auto-trigger)
    const highRiskKeywords = ['hopeless', 'suicide', 'self-harm', 'end it', 'give up', 'no point'];
    const isCriticalSentiment = latestEntry.sentiment_label === 'negative' && 
                                highRiskKeywords.some(kw => (latestEntry.content || '').toLowerCase().includes(kw));

    if (isCriticalSentiment) {
      const reason = `Critical risk detected in latest entry: "${latestEntry.content.substring(0, 50)}..."`;
      
      // Generate Wellness Report PDF for the email
      const { generateWellnessReport } = require('./pdfGenerator');
      const pdfBuffer = await generateWellnessReport(recentEntries.slice(0, 10), user);

      await sendEmergencyAlertEmail(
        contact.email, 
        contact.name, 
        user.username, 
        reason,
        [
          {
            filename: `MindPulse_Wellness_Report_${user.username}.pdf`,
            content: pdfBuffer
          }
        ]
      );
      
      await EmergencyAlert.create({
        user_id: userId,
        alert_type: 'critical_risk',
        reason: reason,
        sent_to: contact.email
      });

      return { action: 'AUTO_SENT', reason };
    }

    // Level 1: Sustained Low Mood (Request Consent)
    if (avgMood < 2.5 && recentEntries.length >= 3) {
      const reason = `Sustained low mood (Avg: ${avgMood.toFixed(1)}) over the last ${DAYS_TO_CHECK} days.`;
      return { action: 'REQUEST_CONSENT', reason };
    }

    return { action: 'NONE', reason: 'Wellness trend is stable.' };
  } catch (error) {
    console.error('Error analyzing wellness trend:', error);
    return { action: 'NONE', reason: 'Internal error during analysis.' };
  }
};

module.exports = { analyzeWellnessTrend };
