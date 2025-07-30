
'use client'; 

import React, { useState, useEffect } from 'react';

const CurrentTime = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    // Update time every second
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h3>Current Time:</h3>
      <p>{time.toLocaleTimeString()}</p>
    </div>
  );
};

export default CurrentTime;
