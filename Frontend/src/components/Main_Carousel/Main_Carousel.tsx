// Used from previous project https://github.com/TypeLuis/Nextjs-Shopify-Project/blob/main/component/Main_carousel/Main_Carousel.js
import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import classes from './Main_Carousel.module.scss'

const Main_Carousel = () => {

    const containerRef = useRef<HTMLDivElement>(null)

    const carouselSlide = (): void => {
        if (!containerRef.current) return

        containerRef.current.style.transition = 'left 1s'

        const containerLeft = parseInt(containerRef.current.style.left)
        containerRef.current.classList.remove(classes.img1)
        containerRef.current.classList.remove(classes.img2)

        if (containerLeft > -window.innerWidth * 0.5) {
            containerRef.current.classList.add(classes.img2)
            containerRef.current.style.left = `${-window.innerWidth}px`
        }

        if (containerLeft < -window.innerWidth * 0.5) {
            containerRef.current.classList.add(classes.img1)
            containerRef.current.style.left = '0px'
        }
    }

    const removeInterval = (): void => {
        const interval_id = window.setInterval(function () { }, Number.MAX_SAFE_INTEGER)
        for (let i = 1; i < interval_id; i++) {
            window.clearInterval(i)
        }
    }

    // Using refs for mutable drag state to avoid stale closures
    const pressedRef = useRef<boolean>(false)
    const startXRef = useRef<number>(0)

    const checkBoundary = (): void => {
        const containerStyle = containerRef.current?.style
        if (!containerStyle) return

        if (parseInt(containerStyle.left) > 0) {
            containerStyle.left = '0px'
        } else if (parseInt(containerStyle.left) < -window.innerWidth) {
            containerStyle.left = `-${window.innerWidth}px`
        }
    }

    const mouseDown = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): void => {
        const target = e.target as HTMLElement
        if (target.tagName === 'SPAN') return

        removeInterval()

        containerRef.current?.classList.remove(classes.img1)
        containerRef.current?.classList.remove(classes.img2)

        if (containerRef.current) containerRef.current.style.transition = ''

        pressedRef.current = true

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
        startXRef.current = clientX - (containerRef.current?.offsetLeft ?? 0)

        target.style.cursor = 'grabbing'
    }

    const mouseEnter = (e: React.MouseEvent<HTMLDivElement>): void => {
        (e.target as HTMLElement).style.cursor = 'grab'
    }

    const mouseUp = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): void => {
        const target = e.target as HTMLElement
        if (target.tagName === 'SPAN') return

        target.style.cursor = 'grab'
        pressedRef.current = false

        if (containerRef.current) containerRef.current.style.transition = 'left 2s'

        const outer = target.getBoundingClientRect()
        const containerLeft = parseInt(containerRef.current?.style.left ?? '0')
        const outerWidth10 = -outer.width * 0.1
        const outerWidth90 = -outer.width * 0.9

        if (containerLeft > -window.innerWidth * 0.5) {
            if (containerLeft > outerWidth10) {
                if (containerRef.current) containerRef.current.style.left = '0px'
                containerRef.current?.classList.add(classes.img1)
            } else {
                if (containerRef.current) containerRef.current.style.left = `-${window.innerWidth}px`
                containerRef.current?.classList.add(classes.img2)
            }
            setInterval(carouselSlide, 8000)
        } else if (containerLeft < -window.innerWidth * 0.5) {
            if (containerLeft < outerWidth90) {
                if (containerRef.current) containerRef.current.style.left = `-${window.innerWidth}px`
                containerRef.current?.classList.add(classes.img2)
            } else {
                if (containerRef.current) containerRef.current.style.left = '0px'
                containerRef.current?.classList.add(classes.img1)
            }
            setInterval(carouselSlide, 8000)
        }
    }

    const mouseMove = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>): void => {
        if (!pressedRef.current) return

        e.stopPropagation()
        e.preventDefault()

        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX

        if (containerRef.current) {
            containerRef.current.style.left = `${clientX - startXRef.current}px`
        }

        checkBoundary()
    }
    useEffect(() => {
        const containerStyle = containerRef.current?.style
        const containerClass = containerRef.current?.classList
        if (!containerStyle || !containerClass) return

        containerStyle.transition = 'left 1s'
        containerClass.add(classes.img1)
        containerStyle.left = '0'

        const addTransition = (): void => {
            containerStyle.transition = 'left 1s'
        }

        let myInterval = window.setInterval(carouselSlide, 8000)

        const removeInterval = (): void => {
            clearInterval(myInterval)
        }

        const buttonSlider = (): void => {
            const sliderButtons = document.getElementsByClassName(classes.slider_button)
            const sliderSpread = Array.from(sliderButtons) as HTMLElement[]

            sliderSpread.forEach((button, i) => {
                button.addEventListener(
                    'click',
                    () => {
                        addTransition()

                        const position = -window.innerWidth * i
                        const index = i

                        containerClass.remove(classes.img1)
                        containerClass.remove(classes.img2)
                        removeInterval()

                        setTimeout(() => {
                            if (index === 0) containerClass.add(classes.img1)
                            if (index === 1) containerClass.add(classes.img2)
                            myInterval = window.setInterval(carouselSlide, 8000)
                        }, 1000)

                        containerStyle.left = `${position}px`
                    },
                    { capture: true }
                )
            })
        }

        const resize = (): void => {
            addTransition()
            containerClass.remove(classes.img1)
            containerClass.remove(classes.img2)
            removeInterval()

            setTimeout(() => {
                containerClass.add(classes.img1)
                containerStyle.left = '0'
                myInterval = window.setInterval(carouselSlide, 8000)
            }, 1000)
        }

        window.onresize = resize
        buttonSlider()

        const appearOptions: IntersectionObserverInit = {
            threshold: 0,
            rootMargin: '-50px 0px',
        }

        const appearOnScroll = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add(classes.fadein)
                }
            })
        }, appearOptions)

        if (containerRef.current) {
            appearOnScroll.observe(containerRef.current)
        }

        return () => {
            removeInterval()
            window.onresize = null
            if (containerRef.current) {
                appearOnScroll.unobserve(containerRef.current)
            }
        }
    }, [])

    return (
        <div
            onMouseDownCapture={mouseDown}
            onMouseEnter={mouseEnter}
            onMouseUp={mouseUp}
            onMouseMove={mouseMove}
            onTouchStart={mouseDown}
            onTouchEnd={mouseUp}
            onTouchMove={mouseMove}
            className={classes.slide_container}
        >
            <div ref={containerRef} id="image-container" className={classes.image_container}>

                <div className={`${classes.first_img} ${classes.img_div}`}>
                    <img
                        src="/images/HomeScreen1.png"
                        className={classes.slider_image}
                        alt="Slide 1"
                    />
                    <div className={classes.text_div}>
                        <h2>Own Your Data</h2>
                        <p>A private cloud that runs in your home — not someone else's server.</p>
                        <Link to="/start">Start Setup</Link>
                    </div>
                </div>

                <div className={`${classes.second_img} ${classes.img_div}`}>
                    <img
                        src="/images/HomeScreen2.png"
                        className={classes.slider_image}
                        alt="Slide 2"
                    />
                    <div className={classes.text_div}>
                        <h2>Self-Hosting Made Easy</h2>
                        <p>VaultBox installs everything automatically in minutes.</p>
                        <Link to="/start">Start Setup</Link>
                    </div>
                </div>

            </div>
            <div className={classes.button_container}>
                <span className={classes.slider_button}></span>
                <span className={classes.slider_button}></span>
            </div>
        </div>
    )
}

export default Main_Carousel