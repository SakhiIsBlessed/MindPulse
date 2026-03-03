const PDFDocument = require('pdfkit');

/**
 * Generates a wellness report PDF as a Buffer.
 * @param {Array} entries - Journal entries.
 * @param {Object} user - User object with username and email.
 * @returns {Promise<Buffer>}
 */
const generateWellnessReport = (entries, user) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            let chunks = [];

            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', (err) => reject(err));

            // Header - Branding
            doc.fillColor('#6c5ce7')
               .fontSize(22)
               .text('MindPulse Mental Health Report', { align: 'left' });
            
            doc.moveDown(0.5);
            doc.fillColor('#444444')
               .fontSize(12)
               .text(`User: ${user.username || 'N/A'}`)
               .text(`Email: ${user.email || 'N/A'}`)
               .text(`Report Date: ${new Date().toLocaleDateString()}`);

            doc.moveDown();
            doc.strokeColor('#6c5ce7')
               .lineWidth(1)
               .moveTo(50, doc.y)
               .lineTo(550, doc.y)
               .stroke();

            doc.moveDown(2);

            // Table Header
            const startY = doc.y;
            const colWidths = [80, 50, 80, 250];
            const colX = [50, 130, 180, 260];
            const headers = ['Date', 'Mood', 'Sentiment', 'Journal Highlights'];

            doc.fillColor('#6c5ce7').fontSize(10).font('Helvetica-Bold');
            headers.forEach((h, i) => {
                doc.text(h, colX[i], startY);
            });

            doc.moveDown(0.5);
            doc.strokeColor('#dddddd').moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown();

            // Table Body
            doc.font('Helvetica').fillColor('#333333');
            
            entries.forEach((entry, index) => {
                if (doc.y > 700) doc.addPage();

                const y = doc.y;
                const date = entry.createdAt ? new Date(entry.createdAt).toLocaleDateString() : 'N/A';
                const mood = `${entry.mood_score || 0} / 5`;
                const sentiment = (entry.sentiment_label || 'Neutral').charAt(0).toUpperCase() + (entry.sentiment_label || 'neutral').slice(1);
                const highlight = (entry.content || 'Voice Note/No Content').substring(0, 120) + (entry.content?.length > 120 ? '...' : '');

                doc.text(date, colX[0], y);
                doc.text(mood, colX[1], y);
                doc.text(sentiment, colX[2], y);
                doc.text(highlight, colX[3], y, { width: colWidths[3], align: 'left' });

                doc.moveDown(1.5);
                doc.strokeColor('#eeeeee').lineWidth(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke();
                doc.moveDown();
            });

            // Footer
            const pageCount = doc.bufferedPageRange().count;
            for (let i = 0; i < pageCount; i++) {
                doc.switchToPage(i);
                doc.fontSize(8).fillColor('#999999').text(
                    `MindPulse Wellness Safety Net - Page ${i + 1} of ${pageCount}`,
                    50,
                    doc.page.height - 40,
                    { align: 'center' }
                );
            }

            doc.end();
        } catch (err) {
            reject(err);
        }
    });
};

module.exports = { generateWellnessReport };
