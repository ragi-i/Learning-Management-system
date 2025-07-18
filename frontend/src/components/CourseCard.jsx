import React, { useState } from 'react';
import './CourseCard.css';

const CourseCard = ({ course }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  if (!course) return null; // Don't render if course is missing

  const {
    thumbnail = 'https://via.placeholder.com/320x180?text=Course+Thumbnail',
    videoUrl = '',
    title = 'Untitled Course',
    description = 'No description provided.',
    instructor = 'Unknown Instructor',
    price = '0'
  } = course;

  return (
    <div className="course-card">
      <div className="thumbnail-wrapper">
        {!isPlaying ? (
          <>
            <img src={thumbnail} alt="thumbnail" className="thumbnail" />
            {videoUrl && (
              <button
                className="play-button"
                onClick={() => setIsPlaying(true)}
                title="Play Video"
              >
                ▶
              </button>
            )}
          </>
        ) : (
          <iframe
            className="video-player"
            src={videoUrl}
            title={title}
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        )}
      </div>

      <div className="course-info">
        <h3>{title}</h3>
        <p>{description}</p>
        <div className="course-meta">
          <span>Instructor: {instructor}</span>
          <span className="price">₹{price}</span>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
