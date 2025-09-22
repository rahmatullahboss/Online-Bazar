'use client'

import React, { useState } from 'react'

interface BlogImageProps {
  src: string
  alt: string
  className?: string
  fill?: boolean
  sizes?: string
}

export const BlogImage: React.FC<BlogImageProps> = ({
  src,
  alt,
  className,
  fill = false,
  sizes,
}) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError) {
      setHasError(true)
      setImgSrc('/placeholder-image.svg')
    }
  }

  // If fill is true, we'll handle it with a div background approach
  if (fill) {
    return (
      <div
        className={className}
        style={{
          backgroundImage: `url(${imgSrc})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      />
    )
  }

  return <img src={imgSrc} alt={alt} className={className} onError={handleError} sizes={sizes} />
}
