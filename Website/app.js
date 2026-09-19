/**
 * Spider-Man: Brand New Day - Three.js 3D Web & GSAP Kinetic Scroll Engine
 */

document.addEventListener('DOMContentLoaded', () => {

    // 1. Initialize Three.js 3D Web Engine
    let web3D = null;
    if (window.Web3DEngine) {
        web3D = new Web3DEngine();
    }

    // 2. Initialize Lenis Smooth Scroll Engine
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true
    });

    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Sync Lenis scroll with Three.js 3D Web Engine & GSAP
    lenis.on('scroll', (e) => {
        if (window.ScrollTrigger) ScrollTrigger.update();
        
        const scrollProgress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
        if (web3D) {
            web3D.setScrollProgress(scrollProgress);
        }
    });

    // 3. Register GSAP ScrollTrigger & Connect with Lenis
    if (window.gsap && window.ScrollTrigger) {
        gsap.registerPlugin(ScrollTrigger);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
    }

    // 4. Custom Spider Cursor Reticle
    const cursor = document.getElementById('spider-cursor');
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = `${e.clientX}px`;
            cursor.style.top = `${e.clientY}px`;
        });
    }

    // 5. 3D Tilt for Hero Card
    initHeroTilt();

    // 6. GSAP SCROLLTRIGGER TIMELINES FOR KINETIC ANIMATION
    if (window.gsap && window.ScrollTrigger) {
        
        // Section 1 Hero Card Scroll Scale & Fade Out
        gsap.to('#hero-card', {
            scale: 0.85,
            opacity: 0.4,
            scrollTrigger: {
                trigger: '#hero',
                start: 'top top',
                end: 'bottom top',
                scrub: true
            }
        });

        // Section 2 "NEEDLESS" Watermark Parallax
        gsap.to('.bg-watermark', {
            y: -150,
            scrollTrigger: {
                trigger: '#section-needless',
                start: 'top bottom',
                end: 'bottom top',
                scrub: true
            }
        });

        // Section 3 "SHE WAS A BAD..." Poster Expansion
        const badthangTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#section-badthang',
                start: 'top center',
                end: 'bottom center',
                scrub: 1
            }
        });

        badthangTimeline.from('#badthang-text', {
            scale: 0.7,
            opacity: 0,
            y: 50
        }).from('#poster-expand', {
            scale: 0.5,
            borderRadius: '50%',
            opacity: 0
        }, '<');

        // Section 4 Inset Cards Slide In ("BABY, I'M A...")
        const cardsTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#section-cards',
                start: 'top center',
                end: 'bottom center',
                scrub: 1
            }
        });

        cardsTimeline.from('.card-left', {
            x: -250,
            opacity: 0,
            rotate: -15
        }).from('.card-right', {
            x: 250,
            opacity: 0,
            rotate: 15
        }, '<').from('.lyric-bold-text', {
            scale: 0.8,
            opacity: 0
        }, '<');

        // Section 5 Encounter ("Peter and Gwen" & "BABY, YOU'RE A WRECK")
        const encounterTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: '#section-encounter',
                start: 'top center',
                end: 'bottom center',
                scrub: 1
            }
        });

        encounterTimeline.from('.profile-spidey', {
            x: -200,
            opacity: 0
        }).from('.profile-gwen', {
            x: 200,
            opacity: 0
        }, '<').from('.hanging-web-line', {
            scaleY: 0,
            transformOrigin: 'top center'
        }, '<').from('.encounter-lyric', {
            scale: 0.8,
            opacity: 0
        }, '<').from('.badge-item', {
            y: 30,
            opacity: 0,
            stagger: 0.2
        });
    }
});

/**
 * 3D Parallax Tilt for Hero Card
 */
function initHeroTilt() {
    const card = document.getElementById('hero-card');
    if (!card) return;

    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        const rotateX = (-y / rect.height) * 15;
        const rotateY = (x / rect.width) * 15;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg)`;
    });
}
