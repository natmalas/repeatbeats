export const AUDIO_PROFILES = {
    clean: {
        title: "Clean",
        build(ctx) {
            return []
        },
        icon: "mdi-circle"
    },

    telephone: {
        title: "Telephone",
        build(ctx) {
            const hp = ctx.createBiquadFilter()
            hp.type = "highpass"
            hp.frequency.value = 500

            const lp = ctx.createBiquadFilter()
            lp.type = "lowpass"
            lp.frequency.value = 3000

            const midBoost = ctx.createBiquadFilter()
            midBoost.type = "peaking"
            midBoost.frequency.value = 1200
            midBoost.Q.value = 1
            midBoost.gain.value = 10

            return [hp, midBoost, lp]
        },
        icon: 'mdi-phone'
    },

    dreamCocoon: {
        title: "Dream Cocoon",
        build(ctx) {

            /* -------------------------------
               Blanket EQ
            -------------------------------- */

            const lp = ctx.createBiquadFilter()
            lp.type = "lowpass"
            lp.frequency.value = 3200
            lp.Q.value = 0.5

            const warmth = ctx.createBiquadFilter()
            warmth.type = "peaking"
            warmth.frequency.value = 420
            warmth.Q.value = 0.7
            warmth.gain.value = 4

            const airCut = ctx.createBiquadFilter()
            airCut.type = "highshelf"
            airCut.frequency.value = 7000
            airCut.gain.value = -6

            /* -------------------------------
               Smoothing compression
            -------------------------------- */

            const comp = ctx.createDynamicsCompressor()
            comp.threshold.value = -26
            comp.ratio.value = 2
            comp.attack.value = 0.05
            comp.release.value = 0.35

            /* -------------------------------
               Dreamy stereo blur (micro-chorus)
            -------------------------------- */

            const splitter = ctx.createChannelSplitter(2)
            const merger = ctx.createChannelMerger(2)

            const delayL = ctx.createDelay()
            delayL.delayTime.value = 0.018

            const delayR = ctx.createDelay()
            delayR.delayTime.value = 0.026

            const lfo = ctx.createOscillator()
            lfo.type = "sine"
            lfo.frequency.value = 0.15

            const lfoGain = ctx.createGain()
            lfoGain.gain.value = 0.004

            lfo.connect(lfoGain)
            lfoGain.connect(delayL.delayTime)
            lfoGain.connect(delayR.delayTime)

            lfo.start()

            /* -------------------------------
               Routing
            -------------------------------- */

            splitter.connect(delayL, 0)
            splitter.connect(delayR, 1)

            delayL.connect(merger, 0, 0)
            delayR.connect(merger, 0, 1)

            merger.connect(warmth)
            warmth.connect(lp)
            lp.connect(airCut)
            airCut.connect(comp)

            return {
                input: splitter,
                output: comp
            }
        },
        icon: "mdi-weather-night"
    },


    eightD: {
        title: "8D Spatial Drift",
        build(ctx) {
            // Stereo panner (actual spatial movement)
            const panner = ctx.createStereoPanner()

            // LFO for slow movement
            const lfo = ctx.createOscillator()
            lfo.type = "sine"
            lfo.frequency.value = 0.05   // ~20 second full cycle

            // Depth control
            const lfoGain = ctx.createGain()
            lfoGain.gain.value = 1       // full left ↔ right sweep

            // LFO → pan
            lfo.connect(lfoGain)
            lfoGain.connect(panner.pan)

            lfo.start()

            return {
                input: panner,
                output: panner
            }
        },
        icon: "mdi-rotate-orbit"
    },

    
    backgroundToForeground: {
        title: "Background → Foreground",
        build(ctx) {
            /* -------------------------------
               Partial center de-emphasis
            -------------------------------- */

            const splitter = ctx.createChannelSplitter(2)

            const invertR = ctx.createGain()
            invertR.gain.value = -0.25   // subtle center reduction

            const sum = ctx.createGain()

            const merger = ctx.createChannelMerger(2)

            /* -------------------------------
               Perceptual EQ shaping
            -------------------------------- */

            // Defocus vocal intelligibility
            const vocalDefocus = ctx.createBiquadFilter()
            vocalDefocus.type = "peaking"
            vocalDefocus.frequency.value = 2400
            vocalDefocus.Q.value = 1
            vocalDefocus.gain.value = -5

            // Reduce lead dominance
            const leadSoftener = ctx.createBiquadFilter()
            leadSoftener.type = "peaking"
            leadSoftener.frequency.value = 1200
            leadSoftener.Q.value = 0.9
            leadSoftener.gain.value = -3

            // Reveal texture & tails
            const textureLift = ctx.createBiquadFilter()
            textureLift.type = "highshelf"
            textureLift.frequency.value = 7000
            textureLift.gain.value = 4

            // Add body to background elements
            const lowMidLift = ctx.createBiquadFilter()
            lowMidLift.type = "peaking"
            lowMidLift.frequency.value = 350
            lowMidLift.Q.value = 0.8
            lowMidLift.gain.value = 3

            /* -------------------------------
               Dynamic rebalance
            -------------------------------- */

            const compressor = ctx.createDynamicsCompressor()
            compressor.threshold.value = -20
            compressor.ratio.value = 2
            compressor.attack.value = 0.015
            compressor.release.value = 0.25

            /* -------------------------------
               Routing
            -------------------------------- */

            // Partial L - R
            splitter.connect(sum, 0)          // L
            splitter.connect(invertR, 1)      // R → invert
            invertR.connect(sum)

            // Back to stereo
            sum.connect(merger, 0, 0)
            sum.connect(merger, 0, 1)

            // Sculpt perception
            merger.connect(vocalDefocus)
            vocalDefocus.connect(leadSoftener)
            leadSoftener.connect(lowMidLift)
            lowMidLift.connect(textureLift)
            textureLift.connect(compressor)

            return {
                input: splitter,
                output: compressor
            }
        },
        icon: 'mdi-layers'
    },

    vocalUnifier: {
        title: "Vocal Unifier",
        build(ctx) {
            const splitter = ctx.createChannelSplitter(2)

            const invertR = ctx.createGain()
            invertR.gain.value = -1

            const sum = ctx.createGain()

            const merger = ctx.createChannelMerger(2)

            // EQ cleanup
            const hp = ctx.createBiquadFilter()
            hp.type = "highpass"
            hp.frequency.value = 120

            const presenceCut = ctx.createBiquadFilter()
            presenceCut.type = "peaking"
            presenceCut.frequency.value = 2500
            presenceCut.Q.value = 1
            presenceCut.gain.value = -4

            /*
              L ----┐
                   ├─> SUM ──> L
              R -> invert ┘        └─> R
            */

            splitter.connect(sum, 0)          // L → sum
            splitter.connect(invertR, 1)      // R → invert
            invertR.connect(sum)              // -R → sum

            sum.connect(merger, 0, 0)          // mono → left
            sum.connect(merger, 0, 1)          // mono → right

            merger.connect(hp)
            hp.connect(presenceCut)

            return {
                input: splitter,
                output: presenceCut
            }
        },
        icon: 'mdi-music-accidental-natural'
    },

    instrumentalSpotlight: {
        title: "Instrumental Spotlight",
        build(ctx) {
            /* -------------------------------
               Partial center de-emphasis
            -------------------------------- */

            const splitter = ctx.createChannelSplitter(2)

            const invertR = ctx.createGain()
            invertR.gain.value = -0.35   // subtle, not full cancel

            const sum = ctx.createGain()
            sum.gain.value = 1

            const merger = ctx.createChannelMerger(2)

            /* -------------------------------
               EQ sculpting
            -------------------------------- */

            // Remove low vocal rumble
            const hp = ctx.createBiquadFilter()
            hp.type = "highpass"
            hp.frequency.value = 90

            // Reduce vocal body
            const vocalBodyCut = ctx.createBiquadFilter()
            vocalBodyCut.type = "peaking"
            vocalBodyCut.frequency.value = 1200
            vocalBodyCut.Q.value = 1.1
            vocalBodyCut.gain.value = -4

            // Reduce vocal intelligibility
            const vocalPresenceCut = ctx.createBiquadFilter()
            vocalPresenceCut.type = "peaking"
            vocalPresenceCut.frequency.value = 2600
            vocalPresenceCut.Q.value = 1
            vocalPresenceCut.gain.value = -5

            // Enhance instrumental detail
            const detailBoost = ctx.createBiquadFilter()
            detailBoost.type = "highshelf"
            detailBoost.frequency.value = 7500
            detailBoost.gain.value = 5

            // Add low-end clarity
            const bassTighten = ctx.createBiquadFilter()
            bassTighten.type = "lowshelf"
            bassTighten.frequency.value = 180
            bassTighten.gain.value = 3

            /* -------------------------------
               Dynamic enhancement
            -------------------------------- */

            const compressor = ctx.createDynamicsCompressor()
            compressor.threshold.value = -22
            compressor.ratio.value = 2.5
            compressor.attack.value = 0.008
            compressor.release.value = 0.18

            /* -------------------------------
               Routing
            -------------------------------- */

            splitter.connect(sum, 0)           // L
            splitter.connect(invertR, 1)       // R → invert
            invertR.connect(sum)

            sum.connect(merger, 0, 0)
            sum.connect(merger, 0, 1)

            merger.connect(hp)
            hp.connect(vocalBodyCut)
            vocalBodyCut.connect(vocalPresenceCut)
            vocalPresenceCut.connect(bassTighten)
            bassTighten.connect(detailBoost)
            detailBoost.connect(compressor)

            return {
                input: splitter,
                output: compressor
            }
        },
        icon: 'mdi-music-clef-treble'
    },

    underwater: {
        title: "Underwater",
        build(ctx) {
            const lp = ctx.createBiquadFilter()
            lp.type = "lowpass"
            lp.frequency.value = 1000

            const notch = ctx.createBiquadFilter()
            notch.type = "notch"
            notch.frequency.value = 2000
            notch.Q.value = 1

            return [lp, notch]
        },
        icon: 'mdi-water'
    },
}