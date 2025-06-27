// contexts/ImageURLContext.js
'use client';
import React, { createContext, useContext } from 'react';

const ImageURLContext = createContext();

export const ImageURLProvider = ({ children }) => {
  function fetchImages(url) {

    if (!url || typeof url !== 'string') {
      return 'https://placehold.co/400';
    }
    if (url.includes('www.')) {
      return url;
    }else{
      return 'https://placehold.co/400';
    }

    const splitPart = url.split('tmp');

    if (splitPart.length < 2) {
      return 'https://placehold.co/400';
    }

    let imagePath = splitPart[1];

    imagePath = imagePath.replace(/^\/+/, '');

    const finalURL = `https://sleeping-owl-we0m.onrender.com/api/images/tmp/${imagePath}`;

    return finalURL;
  }

  return (
    <ImageURLContext.Provider value={{ fetchImages }}>
      {children}
    </ImageURLContext.Provider>
  );
};

// Custom hook
export const useImageURL = () => {
  const context = useContext(ImageURLContext);
  if (!context) {
    throw new Error("useImageURL must be used within an ImageURLProvider");
  }
  return context;
};
