import React, { useEffect, useState } from 'react';

const GalleryCellebration = ({ eventTitle, onComplete }) => {
  const [showCelebration, setShowCelebration] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowCelebration(false);
      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 500); // Small delay for fade out
      }
    }, 3000); // Show celebration for 3 seconds

    return () => clearTimeout(timer);
  }, [onComplete]);

  // Confetti effect
  useEffect(() => {
    if (!showCelebration) return;

    const confettiElements = [];
    const confettiCount = 50;
    const colors = ['#FF6B6B', '#4ECDC4', '#FFE66D', '#95E1D3', '#F38181', '#AA96DA'];

    for (let i = 0; i < confettiCount; i++) {
      const confetti = document.createElement('div');
      confetti.className = 'confetti';
      confetti.style.position = 'fixed';
      confetti.style.width = Math.random() * 10 + 5 + 'px';
      confetti.style.height = Math.random() * 10 + 5 + 'px';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.top = '-10px';
      confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
      confetti.style.opacity = Math.random();
      confetti.style.zIndex = '9999';
      confetti.style.pointerEvents = 'none';
      
      const animation = confetti.animate(
        [
          { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
          { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
        ],
        {
          duration: Math.random() * 3000 + 2000,
          easing: 'cubic-bezier(0.5, 0, 0.5, 1)'
        }
      );

      document.body.appendChild(confetti);
      confettiElements.push(confetti);

      animation.onfinish = () => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      };
    }

    // Cleanup function
    return () => {
      confettiElements.forEach(confetti => {
        if (confetti && confetti.parentNode) {
          confetti.remove();
        }
      });
    };
  }, [showCelebration]);

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[60] transition-opacity duration-500 ${
        showCelebration ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      <div className="text-center animate-bounce-in">
        {/* Celebration Icon */}
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-yellow-400 via-pink-500 to-purple-600 rounded-full flex items-center justify-center animate-spin-slow shadow-2xl">
              <svg 
                className="w-16 h-16 md:w-20 md:h-20 text-white" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </div>
            {/* Pulse rings */}
            <div className="absolute inset-0 rounded-full border-4 border-yellow-400 animate-ping opacity-75"></div>
            <div className="absolute inset-0 rounded-full border-4 border-pink-400 animate-ping opacity-50" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>

        {/* Celebration Text */}
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-pulse">
          🎉 Event Started! 🎉
        </h1>
        {eventTitle && (
          <p className="text-xl md:text-2xl text-white/90 font-semibold mb-2">
            {eventTitle}
          </p>
        )}
        <p className="text-lg md:text-xl text-white/80">
          Let's connect and have fun!
        </p>

        {/* Sparkles */}
        <div className="mt-8 flex justify-center gap-4">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="text-4xl animate-bounce"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              ✨
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes bounce-in {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.6s ease-out;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GalleryCellebration;