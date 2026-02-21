import React from 'react';
import { Youtube } from 'lucide-react';

const StressHelp = () => {
  const videos = [
    {
      title: 'Guided Stress-Relief Session',
      url: 'https://youtu.be/f1LvJUt9fIg?si=Nn4Lr7FCp38OW1DR'
    },
    {
      title: 'Stress Management Video 2',
      url: 'https://youtu.be/iqcAWup2aCE?si=ILBFJiIhTTctMmzT'
    },
    {
      title: 'Quick Stress Tip Short 1',
      url: 'https://youtube.com/shorts/NIW4Nrmqd6k?si=oW7gYiPwqYQSg_5J'
    },
    {
      title: 'Quick Stress Tip Short 2',
      url: 'https://youtube.com/shorts/0dCwcVJBjlY?si=eM65aw3eN7aHANCb'
    }
  ];

  return (
    <main className="page-container stress-help-container">
      <div className="glass-card">
        <h2>Stress Management Videos</h2>
        <p>Click an icon to open the video on YouTube.</p>

        <div className="video-list">
          {videos.map((v, idx) => (
            <a
              key={idx}
              href={v.url}
              target="_blank"
              rel="noopener noreferrer"
              className="video-link"
            >
              <Youtube size={48} className="video-icon" />
              <span className="video-title">{v.title}</span>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
};

export default StressHelp;
