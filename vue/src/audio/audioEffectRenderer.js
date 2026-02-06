import { AUDIO_PROFILES } from "./audioProfiles"

/**
 * Registry of audio effect profiles.
 * Each profile must expose:
 *  - title: string
 *  - build(ctx: BaseAudioContext): AudioNode[]
 */
export const audioEffectProfiles = AUDIO_PROFILES;

/**
 * Main public helper:
 * Generates a WAV blob URL with effects applied
 */
export async function generateProcessedWavUrl(
    audioSrc,
    profileId,
    randomProfiles = []
) {
    const blob = await generateProcessedWavBlob(audioSrc, profileId, randomProfiles)
    return URL.createObjectURL(blob)
}

function createOutputNormalizer(ctx) {
    /* -------------------------------
       1. Gentle dynamic stabilization
    -------------------------------- */

    const glueCompressor = ctx.createDynamicsCompressor()
    glueCompressor.threshold.value = -18
    glueCompressor.ratio.value = 2
    glueCompressor.attack.value = 0.02
    glueCompressor.release.value = 0.25

    /* -------------------------------
       2. Harshness taming
    -------------------------------- */

    const harshnessTamer = ctx.createBiquadFilter()
    harshnessTamer.type = "peaking"
    harshnessTamer.frequency.value = 3500
    harshnessTamer.Q.value = 1
    harshnessTamer.gain.value = -2.5

    /* -------------------------------
       3. Low-end stability
    -------------------------------- */

    const subStabilizer = ctx.createBiquadFilter()
    subStabilizer.type = "highpass"
    subStabilizer.frequency.value = 30

    /* -------------------------------
       4. Final limiter (safety)
    -------------------------------- */

    const limiter = ctx.createDynamicsCompressor()
    limiter.threshold.value = -1
    limiter.ratio.value = 20
    limiter.attack.value = 0.001
    limiter.release.value = 0.05

    /* -------------------------------
       Chain
    -------------------------------- */

    glueCompressor
        .connect(harshnessTamer)
        .connect(subStabilizer)
        .connect(limiter)

    return {
        input: glueCompressor,
        output: limiter
    }
}


/**
 * Generates a WAV Blob with effects applied
 */
export async function generateProcessedWavBlob(
    audioSrc,
    profileId,
    randomProfiles = []
) {
    if (randomProfiles.length === 0) randomProfiles = audioEffectProfiles

    const profile = profileId === "random" ? audioEffectProfiles[randomProfiles[Math.floor(Math.random() * randomProfiles.length)]] : audioEffectProfiles[profileId]

    if (!profile) {
        console.error(`Unknown audio profile: ${profileId}`)
        return audioSrc;
    }

    // Load source audio into AudioBuffer
    const audioBuffer = await decodeAudioSource(audioSrc)

    // Offline context for rendering
    const offlineCtx = new OfflineAudioContext(
        audioBuffer.numberOfChannels,
        audioBuffer.length,
        audioBuffer.sampleRate
    )

    // Create source
    const source = offlineCtx.createBufferSource()
    source.buffer = audioBuffer

    /*const built = profile.build(offlineCtx)

    // LINEAR CHAIN (existing profiles)
    if (Array.isArray(built)) {
        let current = source
        for (const node of built) {
            current.connect(node)
            current = node
        }
        current.connect(offlineCtx.destination)
    }

    // GRAPH PROFILE (vocal remover, mid/side, etc.)
    else if (built?.input && built?.output) {
        source.connect(built.input)
        built.output.connect(offlineCtx.destination)
    }*/

    const built = profile.build(offlineCtx)

    const normalizer = createOutputNormalizer(offlineCtx)

    if (Array.isArray(built)) {
        let current = source
        for (const node of built) {
            current.connect(node)
            current = node
        }
        current.connect(normalizer.input)
        normalizer.output.connect(offlineCtx.destination)
    }

    else if (built?.input && built?.output) {
        source.connect(built.input)
        built.output.connect(normalizer.input)
        normalizer.output.connect(offlineCtx.destination)
    }

    else {
        throw new Error("Invalid audio profile build() return type")
    }

    source.start(0)

    const renderedBuffer = await offlineCtx.startRendering()

    return audioBufferToWavBlob(renderedBuffer)
}

/* ------------------------------------------------------------------ */
/* Utilities */
/* ------------------------------------------------------------------ */

async function decodeAudioSource(src) {
    const ctx = new AudioContext()
    const response = await fetch(src)
    const arrayBuffer = await response.arrayBuffer()
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
    ctx.close()
    return audioBuffer
}

function audioBufferToWavBlob(buffer) {
    const wavData = encodeWav(buffer)
    return new Blob([wavData], { type: "audio/wav" })
}

/**
 * Minimal WAV encoder (32-bit float → 16-bit PCM)
 */
function encodeWav(audioBuffer) {
    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const numFrames = audioBuffer.length
    const bytesPerSample = 2
    const blockAlign = numChannels * bytesPerSample
    const byteRate = sampleRate * blockAlign
    const dataSize = numFrames * blockAlign

    const buffer = new ArrayBuffer(44 + dataSize)
    const view = new DataView(buffer)

    let offset = 0

    writeString(view, offset, "RIFF"); offset += 4
    view.setUint32(offset, 36 + dataSize, true); offset += 4
    writeString(view, offset, "WAVE"); offset += 4
    writeString(view, offset, "fmt "); offset += 4
    view.setUint32(offset, 16, true); offset += 4
    view.setUint16(offset, 1, true); offset += 2
    view.setUint16(offset, numChannels, true); offset += 2
    view.setUint32(offset, sampleRate, true); offset += 4
    view.setUint32(offset, byteRate, true); offset += 4
    view.setUint16(offset, blockAlign, true); offset += 2
    view.setUint16(offset, 16, true); offset += 2
    writeString(view, offset, "data"); offset += 4
    view.setUint32(offset, dataSize, true); offset += 4

    // Interleave channels
    const channels = []
    for (let i = 0; i < numChannels; i++) {
        channels.push(audioBuffer.getChannelData(i))
    }

    for (let i = 0; i < numFrames; i++) {
        for (let ch = 0; ch < numChannels; ch++) {
            let sample = channels[ch][i]
            sample = Math.max(-1, Math.min(1, sample))
            view.setInt16(offset, sample * 0x7fff, true)
            offset += 2
        }
    }

    return buffer
}

function writeString(view, offset, str) {
    for (let i = 0; i < str.length; i++) {
        view.setUint8(offset + i, str.charCodeAt(i))
    }
}