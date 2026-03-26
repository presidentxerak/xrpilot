"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Play, Pause } from "lucide-react"

const VIDEO_SRC = "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hero-video-OESGMvgLUXosPtQhtYjxokzQvJ7LJO.mp4"

interface VideoCarouselProps {
  children?: React.ReactNode
}

export function VideoCarousel({ children }: VideoCarouselProps) {
  const [isPlaying, setIsPlaying] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (video) {
      video.play().catch(() => {
        setIsPlaying(false)
      })
    }
  }, [])

  return (
    <div className="relative w-full min-h-[100svh] overflow-hidden bg-foreground">
      {/* Video Background */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={VIDEO_SRC} type="video/mp4" />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-full max-w-7xl mx-auto px-6">{children}</div>
      </div>

      {/* Play/Pause Button */}
      <button
        onClick={togglePlay}
        className="absolute top-24 right-6 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
        aria-label={isPlaying ? "Pause video" : "Play video"}
      >
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </button>
    </div>
  )
}
