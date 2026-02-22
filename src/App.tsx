/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import SplitType from 'split-type';
import { TextGenerateEffect } from './components/ui/text-generate-effect';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // --- 1. Lenis Smooth Scroll Setup ---
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      touchMultiplier: 2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // --- 2. Custom Cursor Logic ---
    const isTouchDevice =
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerWidth <= 768;

    if (!isTouchDevice) {
      const cursorDot = document.querySelector('.cursor-dot') as HTMLElement;
      const cursorOutline = document.querySelector('.cursor-outline') as HTMLElement;
      const hoverables = document.querySelectorAll('.hoverable');

      if (cursorDot && cursorOutline) {
        gsap.set([cursorDot, cursorOutline], {
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
        });

        let mouseX = 0,
          mouseY = 0,
          outlineX = 0,
          outlineY = 0,
          cursorVisible = false;

        const onMouseMove = (e: MouseEvent) => {
          mouseX = e.clientX;
          mouseY = e.clientY;
          if (!cursorVisible) {
            gsap.to([cursorDot, cursorOutline], { opacity: 1, duration: 0.3 });
            cursorVisible = true;
          }
          cursorDot.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
        };

        window.addEventListener('mousemove', onMouseMove);

        const ticker = () => {
          outlineX += (mouseX - outlineX) * 0.15;
          outlineY += (mouseY - outlineY) * 0.15;
          cursorOutline.style.transform = `translate3d(${outlineX}px, ${outlineY}px, 0) translate(-50%, -50%)`;
        };
        gsap.ticker.add(ticker);

        const onMouseLeave = () => {
          gsap.to([cursorDot, cursorOutline], { opacity: 0, duration: 0.3 });
          cursorVisible = false;
        };
        document.addEventListener('mouseleave', onMouseLeave);

        hoverables.forEach((el) => {
          el.addEventListener('mouseenter', () =>
            document.body.classList.add('cursor-hover')
          );
          el.addEventListener('mouseleave', () =>
            document.body.classList.remove('cursor-hover')
          );
        });

        // Cleanup cursor events
        return () => {
          window.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseleave', onMouseLeave);
          gsap.ticker.remove(ticker);
          lenis.destroy();
        };
      }
    }

    return () => {
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
     // --- 3. Magnetic Button Interaction ---
     const isTouchDevice =
     'ontouchstart' in window ||
     navigator.maxTouchPoints > 0 ||
     window.innerWidth <= 768;

     if (!isTouchDevice) {
        const magneticWraps = document.querySelectorAll('.magnetic-wrap');
        magneticWraps.forEach((wrap) => {
          const btn = wrap.querySelector('.magnetic-btn');
          if (!btn) return;
          
          const onMouseMove = (e: Event) => {
            const mouseEvent = e as MouseEvent;
            const rect = wrap.getBoundingClientRect();
            const x = (mouseEvent.clientX - rect.left - rect.width / 2) * 0.4;
            const y = (mouseEvent.clientY - rect.top - rect.height / 2) * 0.4;
            gsap.to(btn, { x: x, y: y, duration: 0.5, ease: 'power2.out' });
          };

          const onMouseLeave = () => {
            gsap.to(btn, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.3)' });
          };

          wrap.addEventListener('mousemove', onMouseMove);
          wrap.addEventListener('mouseleave', onMouseLeave);
        });
     }

    // --- 4. Intro Loading Animation ---
    const timer = setTimeout(() => {
        const heroTitles = new SplitType('.text-anim', { types: 'chars' });
        
        const tlIntro = gsap.timeline();

        tlIntro
        .to('.nav-anim', {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power2.out',
            delay: 0.2,
        })
        .to(
            '.fade-in-elem',
            { y: 0, opacity: 1, duration: 1, stagger: 0.1, ease: 'power3.out' },
            '-=0.8'
        )
        .to('.text-anim', { opacity: 1, duration: 0.1 }, "-=0.8")
        .to(
            heroTitles.chars,
            { y: 0, duration: 0.8, stagger: 0.015, ease: 'back.out(1.5)' },
            '-=0.8'
        )
        .to(
            '.image-anim',
            { opacity: 1, y: 0, duration: 1.2, ease: 'power3.out' },
            '-=0.6'
        );

        // --- 5. Pure Parallax on scroll ---
        gsap.to(".parallax-text", {
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: true,
            },
            yPercent: 30, // Text namber taratari
            opacity: 0.2
        });

        gsap.to(".parallax-img", {
            scrollTrigger: {
                trigger: "#hero",
                start: "top top",
                end: "bottom top",
                scrub: true,
            },
            yPercent: 15, // Image namber aste aste
            filter: "blur(4px)"
        });

    }, 100);

    return () => {
        clearTimeout(timer);
        ScrollTrigger.getAll().forEach(t => t.kill());
    };

  }, []);

  return (
    <div className="flex flex-col min-h-screen selection:bg-brandRed selection:text-white" ref={containerRef}>
      <div className="noise-bg"></div>

      {/* Custom Cursor */}
      <div className="cursor-dot"></div>
      <div className="cursor-outline"></div>

      {/* Navigation */}
      <nav className="w-full flex items-center justify-between px-6 md:px-12 py-6 fixed top-0 z-50 mix-blend-difference opacity-0 nav-anim">
        <div className="text-2xl md:text-3xl font-black tracking-tighter hoverable">
          Alif<span className="text-brandRed">.</span>
        </div>

        <div className="hidden md:flex items-center space-x-10 text-sm font-medium text-gray-300">
          <a
            href="#vision"
            className="hoverable hover:text-white transition-colors relative group"
          >
            Vision
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brandRed transition-all duration-300 group-hover:w-full"></span>
          </a>
          <a
            href="#ventures"
            className="hoverable hover:text-white transition-colors relative group"
          >
            Ventures
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-brandRed transition-all duration-300 group-hover:w-full"></span>
          </a>
        </div>

        <div className="magnetic-wrap hidden md:block">
          <a
            href="#contact"
            className="magnetic-btn hoverable bg-white text-black px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-brandRed hover:text-white transition-colors duration-300 inline-block"
          >
            Let's Talk
          </a>
        </div>
        <a
          href="#contact"
          className="md:hidden hoverable bg-white text-black px-5 py-2 rounded-full text-xs font-semibold"
        >
          Talk
        </a>
      </nav>

      {/* Main Content Wrapped for Lenis Smooth Scroll */}
      <div id="smooth-wrapper" className="relative z-10 bg-[#050505] mb-[80vh]">
        <div id="smooth-content">
          {/* 1. Hero Section (Award-Winning Clean Overlap Structure) */}
          <section
            id="hero"
            className="relative w-full h-[100dvh] min-h-[700px] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Intro Paragraph (Top Center) */}
            <div className="absolute top-[18%] md:top-[22%] z-30 opacity-0 fade-in-elem w-full text-center px-4">
              <p className="text-gray-400 font-medium text-sm md:text-lg">
                👋, my name is Alif Shahariar. Founder of{' '}
                <a
                  href="#"
                  className="text-white hover:text-brandRed transition-colors hoverable border-b border-gray-600 hover:border-brandRed pb-0.5"
                >
                  Examio.xyz
                </a>
              </p>
            </div>

            {/* Massive Background Typography (Fixed Center) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex flex-col items-center justify-center z-10 pointer-events-none parallax-text">
              <div className="overflow-hidden w-full text-center py-2">
                <h1 className="hero-title font-display uppercase tracking-tight text-white m-0 opacity-0 text-anim">
                  Tech Founder
                </h1>
              </div>
              {/* Negative margin brings them tighter */}
              <div className="overflow-hidden w-full text-center -mt-[4vw] md:-mt-[3vw] pointer-events-auto hoverable py-2">
                <h1 className="hero-title font-display uppercase tracking-tight text-outline-red m-0 opacity-0 text-anim transition-colors duration-300">
                  & AI Enthusiast
                </h1>
              </div>
            </div>

            {/* Foreground User Image (Anchored perfectly to the bottom) */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 w-[95%] sm:w-[70%] md:w-[60%] lg:w-[45%] max-w-[700px] h-[75vh] pointer-events-none flex items-end justify-center opacity-0 image-anim parallax-img">
              <img
                src="https://res.cloudinary.com/dejm7pz1d/image/upload/v1771718749/IMG_3072_m8dqgg.png"
                alt="Alif Shahariar"
                className="w-full h-full object-contain object-bottom img-mask-fade filter grayscale transition-all duration-700 pointer-events-auto hover:grayscale-0"
              />
            </div>

            {/* Location Info (Bottom Left) */}
            <div className="absolute bottom-8 left-6 md:left-12 z-30 opacity-0 fade-in-elem">
              <div className="text-xs md:text-sm text-gray-500">
                based in <br />
                <span className="text-gray-300 font-medium">
                  Natore, Bangladesh.
                </span>
              </div>
            </div>

            {/* Scroll Down Indicator (Bottom Right) */}
            <div className="absolute bottom-12 right-6 md:right-12 z-30 opacity-0 fade-in-elem flex flex-col items-center gap-2 hidden md:flex">
              <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 rotate-90 translate-y-6">
                Scroll
              </span>
              <div className="w-[1px] h-16 bg-gradient-to-b from-brandRed to-transparent mt-8"></div>
            </div>
          </section>

          {/* Marquee Section */}
          <div className="bg-brandRed text-white py-4 border-y border-red-900 rotate-[-2deg] scale-105 my-10 md:my-20 overflow-hidden relative z-20 shadow-2xl">
            <div className="marquee-wrapper font-display text-4xl md:text-5xl uppercase tracking-wider">
              <div className="flex whitespace-nowrap gap-8 px-4 items-center">
                <span>Founder @ Examio.xyz</span>{' '}
                <i className="ph-fill ph-star-four text-2xl"></i>
                <span>AI Innovations</span>{' '}
                <i className="ph-fill ph-star-four text-2xl"></i>
                <span>Tech Entrepreneur</span>{' '}
                <i className="ph-fill ph-star-four text-2xl"></i>
              </div>
              <div
                className="flex whitespace-nowrap gap-8 px-4 items-center"
                aria-hidden="true"
              >
                <span>Founder @ Examio.xyz</span>{' '}
                <i className="ph-fill ph-star-four text-2xl"></i>
                <span>AI Innovations</span>{' '}
                <i className="ph-fill ph-star-four text-2xl"></i>
                <span>Tech Entrepreneur</span>{' '}
                <i className="ph-fill ph-star-four text-2xl"></i>
              </div>
            </div>
          </div>

          {/* 2. Vision Section (With Text Generate Effect) */}
          <section
            id="vision"
            className="min-h-[80vh] py-24 md:py-32 px-5 md:px-12 w-full flex flex-col justify-center items-center relative z-10 border-t border-gray-900"
          >
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
              <p className="text-[10px] md:text-xs tracking-[0.3em] text-brandRed uppercase font-semibold mb-8">
                01 // The Vision
              </p>

              {/* Text Generate Effect Class */}
              <TextGenerateEffect
                words="Building innovative products driven by AI. Passionate about scaling startups and solving real-world problems."
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-medium leading-[1.15] text-white tracking-wide"
              />

              <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 text-left w-full border-t border-gray-800 pt-16">
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
                    <i className="ph ph-rocket-launch text-brandRed"></i>{' '}
                    Startup Founder
                  </h4>
                  <p className="text-gray-400 text-base leading-relaxed">
                    Leading the vision, strategy, and execution of
                    next-generation digital platforms designed to create massive
                    impact in the modern ecosystem.
                  </p>
                </div>
                <div>
                  <h4 className="text-2xl font-bold mb-4 text-white flex items-center gap-3">
                    <i className="ph ph-cpu text-brandRed"></i> AI Enthusiast
                  </h4>
                  <p className="text-gray-400 text-base leading-relaxed">
                    Deeply exploring how Artificial Intelligence and Machine
                    Learning technologies can be leveraged to completely disrupt
                    traditional industries.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 3. Ventures Section */}
          <section
            id="ventures"
            className="min-h-screen py-24 md:py-32 px-5 md:px-12 w-full flex items-center relative z-10 border-t border-gray-900 bg-[#050505]"
          >
            <div className="w-full max-w-6xl mx-auto flex flex-col">
              <h2 className="text-[10px] md:text-xs tracking-[0.3em] text-brandRed uppercase font-semibold mb-16 text-center md:text-left">
                02 // Key Ventures
              </h2>

              <div className="flex flex-col w-full border-t border-gray-800">
                {/* Venture 1 */}
                <div className="py-12 md:py-20 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between group cursor-pointer hoverable">
                  <div className="md:w-1/2">
                    <h3 className="text-5xl md:text-7xl lg:text-[7rem] font-display uppercase text-white group-hover:-webkit-text-stroke-[2px] group-hover:-webkit-text-stroke-brandRed group-hover:text-transparent transition-all duration-500 mb-6 md:mb-0 leading-none break-words">
                      Examio.xyz
                    </h3>
                  </div>
                  <div className="md:w-1/2 md:pl-12 flex flex-col items-start">
                    <p className="text-gray-400 text-base md:text-lg mb-8 max-w-md">
                      A next-generation digital platform scaling education,
                      assessment, and tech infrastructure through AI-driven
                      methodologies.
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-brandRed text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold border border-gray-800 px-4 py-2 rounded-full group-hover:border-brandRed transition-colors">
                        Founder • Architecture
                      </p>
                      <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center group-hover:bg-brandRed text-white transition-all duration-300 transform group-hover:rotate-45">
                        <i className="ph ph-arrow-up-right text-lg"></i>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Venture 2 */}
                <div className="py-12 md:py-20 border-b border-gray-800 flex flex-col md:flex-row md:items-center justify-between group cursor-pointer hoverable">
                  <div className="md:w-1/2">
                    <h3 className="text-5xl md:text-7xl lg:text-[7rem] font-display uppercase text-white group-hover:-webkit-text-stroke-[2px] group-hover:-webkit-text-stroke-brandRed group-hover:text-transparent transition-all duration-500 mb-6 md:mb-0 leading-none break-words">
                      AI Labs
                    </h3>
                  </div>
                  <div className="md:w-1/2 md:pl-12 flex flex-col items-start">
                    <p className="text-gray-400 text-base md:text-lg mb-8 max-w-md">
                      Internal research initiatives focusing on Machine Learning
                      workflow optimization and automated intelligent agents.
                    </p>
                    <div className="flex items-center gap-4">
                      <p className="text-brandRed text-[10px] md:text-xs tracking-[0.2em] uppercase font-bold border border-gray-800 px-4 py-2 rounded-full group-hover:border-brandRed transition-colors">
                        ML • Automation
                      </p>
                      <div className="w-10 h-10 rounded-full border border-gray-700 flex items-center justify-center group-hover:bg-brandRed text-white transition-all duration-300 transform group-hover:rotate-45">
                        <i className="ph ph-arrow-up-right text-lg"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Footer Reveal Spacer (Tells the page to scroll past so footer shows from behind) */}
          <div
            id="footer-trigger"
            className="h-[80vh] w-full bg-transparent pointer-events-none"
          ></div>
        </div>
      </div>

      {/* 4. Parallax Fixed Footer */}
      <footer
        id="contact"
        className="fixed bottom-0 left-0 w-full h-[80vh] flex flex-col items-center justify-center bg-[#050505] z-0 px-5 md:px-12 border-t border-gray-900"
      >
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center w-full relative z-10">
          <p className="text-brandRed uppercase tracking-[0.3em] text-[10px] md:text-xs font-bold mb-6">
            Ready to innovate?
          </p>
          <h2 className="text-4xl sm:text-5xl md:text-8xl font-display uppercase tracking-tighter mb-6 md:mb-8 hoverable leading-none">
            Let's build the <br />
            <span className="text-outline-red">future.</span>
          </h2>

          <div className="magnetic-wrap mt-2 md:mt-4">
            <a
              href="mailto:alif@examio.xyz"
              className="magnetic-btn inline-block text-xl sm:text-2xl md:text-4xl font-medium border-b-2 border-brandRed pb-1 md:pb-2 hover:text-brandRed transition-colors hoverable break-all"
            >
              alif@examio.xyz
            </a>
          </div>

          <div className="mt-16 md:mt-24 flex flex-wrap justify-center gap-6 md:gap-12 text-gray-500 text-sm md:text-lg uppercase tracking-wider font-semibold">
            <a href="#" className="hover:text-white transition-colors hoverable">
              Twitter
            </a>
            <a href="#" className="hover:text-white transition-colors hoverable">
              LinkedIn
            </a>
            <a href="#" className="hover:text-white transition-colors hoverable">
              Examio.xyz
            </a>
          </div>

          <p className="mt-12 md:mt-16 text-xs text-gray-700">
            © 2026 ALIF SHAHARIAR. BUILT IN BANGLADESH.
          </p>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-display font-black text-white/[0.02] whitespace-nowrap pointer-events-none z-0 select-none">
          ALIF SHAHARIAR
        </div>
      </footer>
    </div>
  );
}
