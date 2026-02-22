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
import { TypewriterEffectSmooth } from './components/ui/typewriter-effect';
import { EncryptedText } from './components/ui/encrypted-text';

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
        const heroTitles = new SplitType('.text-anim', { types: 'chars, words' });
        
        const tlIntro = gsap.timeline();

        // FIX: Set everything to its FINAL position immediately to prevent layout shift
        // Only animate opacity/blur/filter, NOT position for layout-critical elements
        gsap.set('.text-anim', { opacity: 1 });
        gsap.set(heroTitles.chars, { y: 60, opacity: 0, filter: 'blur(8px)' });
        
        // FIX: Image - do NOT animate x/y that could cause left-right shift
        // Only animate opacity, scale(subtle), blur
        gsap.set('.image-anim', { opacity: 0, scale: 1.04, filter: 'blur(15px)' });
        gsap.set('.fade-in-elem', { opacity: 0, filter: 'blur(4px)' });

        tlIntro
        .to('.nav-anim', {
            opacity: 1,
            y: 0,
            duration: 1.2,
            ease: 'power3.out',
            delay: 0.2,
        })
        .to(
            heroTitles.chars,
            { 
                y: 0, 
                opacity: 1, 
                filter: 'blur(0px)', 
                duration: 1.5, 
                stagger: 0.02, 
                ease: 'power4.out' 
            },
            '-=0.8'
        )
        .to(
            '.image-anim',
            { 
                opacity: 1, 
                scale: 1, 
                filter: 'blur(0px)', 
                duration: 1.8, 
                ease: 'expo.out' 
            },
            '-=1.2'
        )
        .to(
            '.fade-in-elem',
            { 
                opacity: 1, 
                filter: 'blur(0px)', 
                duration: 1, 
                stagger: 0.1, 
                ease: 'power2.out' 
            },
            '-=1.0'
        );

        // --- 5. Organic Blurry Scroll Parallax ---
        gsap.fromTo(".parallax-text", 
            { yPercent: 0, opacity: 1, filter: "blur(0px)", scale: 1 },
            {
                scrollTrigger: {
                    trigger: "#hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
                yPercent: 50, 
                opacity: 0,
                filter: "blur(15px)",
                scale: 0.9,
                ease: "none"
            }
        );

        gsap.fromTo(".parallax-img", 
            { yPercent: 0, scale: 1, filter: "blur(0px) grayscale(0%)" },
            {
                scrollTrigger: {
                    trigger: "#hero",
                    start: "top top",
                    end: "bottom top",
                    scrub: true,
                },
                yPercent: 20,
                scale: 0.95,
                filter: "blur(8px) grayscale(50%)",
                ease: "none"
            }
        );

        // --- 6. Premium Scroll Reveal Animations ---
        const revealElements = document.querySelectorAll('.reveal-on-scroll');
        revealElements.forEach((el) => {
            gsap.fromTo(el, 
                { y: 50, opacity: 0, filter: 'blur(10px)' },
                {
                    y: 0, 
                    opacity: 1, 
                    filter: 'blur(0px)',
                    duration: 1.2,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: el,
                        start: 'top 85%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // --- 7. Line Drawing Animation ---
        const lines = document.querySelectorAll('.line-reveal');
        lines.forEach((line) => {
            gsap.fromTo(line,
                { scaleX: 0, transformOrigin: "left center" },
                {
                    scaleX: 1,
                    duration: 1.5,
                    ease: 'expo.out',
                    scrollTrigger: {
                        trigger: line,
                        start: 'top 90%',
                        toggleActions: 'play none none reverse'
                    }
                }
            );
        });

        // --- 8. Footer Reveal Animation ---
        gsap.fromTo(".footer-content", 
            { y: 50, opacity: 0, filter: 'blur(10px)' },
            {
                y: 0,
                opacity: 1,
                filter: 'blur(0px)',
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: "#footer-trigger",
                    start: "top 70%", 
                    toggleActions: "play none none reverse"
                }
            }
        );

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

      </nav>

      {/* Main Content */}
      <div id="smooth-wrapper" className="relative z-10 bg-[#050505] mb-[80vh]">
        <div id="smooth-content">

          {/* 1. Hero Section */}
          <section
            id="hero"
            className="relative w-full h-[100dvh] flex flex-col items-center justify-center overflow-hidden"
          >
            {/* Ambient Glow */}
            <div className="ambient-glow-red"></div>

            {/*
             * ============================================================
             * HERO TEXT LAYER SYSTEM
             * The trick: two copies of both lines, one behind image (z-10),
             * one in front (z-30). The "behind" copy shows line 1 only,
             * the "front" copy shows line 2 only. Image sits at z-20.
             * ============================================================
             */}

            {/* --- TEXT BEHIND IMAGE: only "TECH FOUNDER" is visible --- */}
            <div
              className="
                absolute
                left-1/2 -translate-x-1/2
                w-full flex flex-col items-center justify-center
                z-10 pointer-events-none parallax-text
                top-[38%] md:top-[40%] -translate-y-1/2
              "
            >
              {/* LINE 1: TECH FOUNDER — VISIBLE, sits behind image */}
              <div className="overflow-hidden w-full text-center py-1">
                <h1 className="hero-title font-display uppercase tracking-tight text-white m-0 opacity-0 text-anim leading-none">
                  Tech Founder
                </h1>
              </div>
              {/* LINE 2: placeholder (invisible, keeps layout spacing) */}
              <div className="overflow-hidden w-full text-center -mt-[3vw] md:-mt-[2.5vw] py-1 opacity-0 pointer-events-none select-none">
                <h1 className="hero-title font-display uppercase tracking-tight m-0 leading-none">
                  &amp; Ai Enthusiast
                </h1>
              </div>
            </div>

            {/* --- IMAGE (middle layer z-20) --- */}
            <div
              className="
                absolute bottom-0 left-1/2 -translate-x-1/2
                z-20 pointer-events-none
                w-[85%] sm:w-[65%] md:w-[55%] lg:w-[42%] max-w-[680px]
                h-[78dvh] md:h-[80vh]
                flex items-end justify-center
                opacity-0 image-anim parallax-img
              "
            >
              <img
                src="https://res.cloudinary.com/dejm7pz1d/image/upload/v1771718749/IMG_3072_m8dqgg.png"
                alt="Alif Shahariar"
                className="w-full h-full object-contain object-bottom founder-image-glow pointer-events-auto"
                style={{ display: 'block' }}
              />
            </div>

            {/* --- TEXT IN FRONT OF IMAGE: only "& AI ENTHUSIAST" is visible --- */}
            <div
              className="
                absolute
                left-1/2 -translate-x-1/2
                w-full flex flex-col items-center justify-center
                z-30 pointer-events-none parallax-text
                top-[38%] md:top-[40%] -translate-y-1/2
              "
            >
              {/* LINE 1: placeholder (invisible, keeps spacing identical) */}
              <div className="overflow-hidden w-full text-center py-1 opacity-0 pointer-events-none select-none">
                <h1 className="hero-title font-display uppercase tracking-tight m-0 leading-none">
                  Tech Founder
                </h1>
              </div>
              {/* LINE 2: & AI ENTHUSIAST — VISIBLE, sits in front of image */}
              <div className="overflow-hidden w-full text-center -mt-[3vw] md:-mt-[2.5vw] pointer-events-auto hoverable py-1">
                <h1 className="hero-title font-display uppercase tracking-tight text-outline-red m-0 opacity-0 text-anim leading-none transition-colors duration-300">
                  &amp; Ai Enthusiast
                </h1>
              </div>
            </div>

            {/* Location Info (Bottom Left) */}
            <div className="absolute bottom-6 left-6 md:bottom-8 md:left-12 z-30 opacity-0 fade-in-elem">
              <div className="text-xs md:text-sm text-gray-500">
                Founder of <br />
                <span className="text-gray-300 font-medium">
                  Examio.xyz
                </span>
              </div>
            </div>

            {/* Scroll Down Indicator (Bottom Right) — desktop only */}
            <div className="absolute bottom-12 right-6 md:right-12 z-30 opacity-0 fade-in-elem hidden md:flex flex-col items-center gap-2">
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

          {/* 2. Vision Section */}
          <section
            id="vision"
            className="min-h-[80vh] py-24 md:py-32 px-5 md:px-12 w-full flex flex-col justify-center items-center relative z-10"
          >
            <div className="w-full h-[1px] bg-gray-900 absolute top-0 left-0 line-reveal"></div>
            <div className="w-full max-w-5xl mx-auto flex flex-col items-center text-center">
              <p className="reveal-on-scroll text-[10px] md:text-xs tracking-[0.3em] text-brandRed uppercase font-semibold mb-8">
                01 // The Vision
              </p>

              <TextGenerateEffect
                words="Building innovative products driven by AI. Passionate about scaling startups and solving real-world problems."
                className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-serif font-medium leading-[1.2] text-white tracking-wide"
                highlightWords={["AI", "Passionate", "startups", "real-world"]}
              />

              <div className="mt-20 grid grid-cols-1 md:grid-cols-2 gap-12 text-left w-full pt-16 relative">
                <div className="w-full h-[1px] bg-gray-800 absolute top-0 left-0 line-reveal"></div>
                <div className="reveal-on-scroll">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ph ph-rocket-launch text-brandRed text-2xl"></i>
                    <TypewriterEffectSmooth 
                      words={[{ text: "Startup", className: "text-white text-2xl font-bold" }, { text: "Founder", className: "text-white text-2xl font-bold" }]}
                      className="my-0"
                      cursorClassName="bg-brandRed h-6 md:h-8"
                    />
                  </div>
                  <p className="text-gray-400 text-base leading-relaxed">
                    Leading the vision, strategy, and execution of
                    next-generation digital platforms designed to create massive
                    impact in the modern ecosystem.
                  </p>
                </div>
                <div className="reveal-on-scroll">
                  <div className="flex items-center gap-2 mb-4">
                    <i className="ph ph-cpu text-brandRed text-2xl"></i>
                    <TypewriterEffectSmooth 
                      words={[{ text: "AI", className: "text-white text-2xl font-bold" }, { text: "Enthusiast", className: "text-white text-2xl font-bold" }]}
                      className="my-0"
                      cursorClassName="bg-brandRed h-6 md:h-8"
                    />
                  </div>
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
            className="min-h-screen py-24 md:py-32 px-5 md:px-12 w-full flex items-center relative z-10 bg-[#050505]"
          >
            <div className="w-full h-[1px] bg-gray-900 absolute top-0 left-0 line-reveal"></div>
            <div className="w-full max-w-6xl mx-auto flex flex-col">
              <h2 className="reveal-on-scroll text-[10px] md:text-xs tracking-[0.3em] text-brandRed uppercase font-semibold mb-16 text-center md:text-left">
                02 // Key Ventures
              </h2>

              <div className="flex flex-col w-full relative">
                <div className="w-full h-[1px] bg-gray-800 absolute top-0 left-0 line-reveal"></div>
                {/* Venture 1 */}
                <div className="reveal-on-scroll py-12 md:py-20 flex flex-col md:flex-row md:items-center justify-between group cursor-pointer hoverable relative">
                  <div className="w-full h-[1px] bg-gray-800 absolute bottom-0 left-0 line-reveal"></div>
                  <div className="md:w-1/2">
                    <h3 className="text-5xl md:text-7xl lg:text-[7rem] font-display uppercase text-white group-hover:-webkit-text-stroke-[2px] group-hover:-webkit-text-stroke-brandRed group-hover:text-transparent transition-all duration-500 mb-6 md:mb-0 leading-none break-words">
                      <EncryptedText 
                        text="Examio.xyz" 
                        revealDelayMs={100}
                        encryptedClassName="text-brandRed"
                      />
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
                <div className="reveal-on-scroll py-12 md:py-20 flex flex-col md:flex-row md:items-center justify-between group cursor-pointer hoverable relative">
                  <div className="w-full h-[1px] bg-gray-800 absolute bottom-0 left-0 line-reveal"></div>
                  <div className="md:w-1/2">
                    <h3 className="text-5xl md:text-7xl lg:text-[7rem] font-display uppercase text-white group-hover:-webkit-text-stroke-[2px] group-hover:-webkit-text-stroke-brandRed group-hover:text-transparent transition-all duration-500 mb-6 md:mb-0 leading-none break-words">
                      <EncryptedText 
                        text="AI Labs" 
                        revealDelayMs={100}
                        encryptedClassName="text-brandRed"
                      />
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

          {/* Footer Reveal Spacer */}
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
        <div className="footer-content max-w-7xl mx-auto flex flex-col items-center text-center w-full relative z-10">
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
            © 2026 ALIF SHAHARIAR❤️.
          </p>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[15vw] font-display font-black text-white/[0.02] whitespace-nowrap pointer-events-none z-0 select-none">
          ALIF SHAHARIAR
        </div>
      </footer>
    </div>
  );
}
