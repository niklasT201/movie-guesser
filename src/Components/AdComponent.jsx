// AdComponent.jsx
import React, { useEffect } from 'react';

const AdComponent = ({ adClient, adSlot }) => {
  useEffect(() => {
    // This will trigger the ads to be displayed
    window.adsbygoogle = window.adsbygoogle || [];
    window.adsbygoogle.push({});
  }, []);

  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    ></ins>
  );
};

export default AdComponent;