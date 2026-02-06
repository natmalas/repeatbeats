export function convertTimestamp(value, output) {
  if (output !== "number" && output !== "timestamp") {
    throw new Error('Output must be either "number" or "timestamp"')
  }

  // ---------- NUMBER INPUT ----------
  if (typeof value === "number") {
    if (isNaN(value)) return null

    // number → number (normalize)
    if (output === "number") {
      return Number(value.toFixed(2))
    }

    // number → timestamp
    let remaining = value

    const hours = Math.floor(remaining / 3600)
    remaining %= 3600

    const minutes = Math.floor(remaining / 60)
    const seconds = remaining % 60

    const formattedSeconds = seconds
      .toFixed(2)
      .replace(/\.?0+$/, "")

    const paddedSeconds =
      seconds < 10 ? `0${formattedSeconds}` : formattedSeconds

    const paddedMinutes =
      hours > 0 && minutes < 10 ? `0${minutes}` : minutes

    // 🔒 keep old behavior if < 1 hour
    if (hours === 0) {
      return `${minutes}:${paddedSeconds}`
    }

    return `${hours}:${paddedMinutes}:${paddedSeconds}`
  }

  // ---------- TIMESTAMP INPUT ----------
  if (typeof value === "string") {
    // supports:
    // mm:ss(.xx)
    // h:mm:ss(.xx)
    // hh:mm:ss(.xx)
    const match = value.match(
      /^(\d+):(\d{1,2}):(\d{1,2}(?:\.\d{1,2})?)$|^(\d+):(\d{1,2}(?:\.\d{1,2})?)$/
    )

    if (!match) return null

    let hours = 0
    let minutes
    let seconds

    // h:mm:ss
    if (match[1] !== undefined) {
      hours = parseInt(match[1], 10)
      minutes = parseInt(match[2], 10)
      seconds = parseFloat(match[3])
    }
    // mm:ss
    else {
      minutes = parseInt(match[4], 10)
      seconds = parseFloat(match[5])
    }

    const totalSeconds =
      hours * 3600 + minutes * 60 + seconds

    // timestamp → number
    if (output === "number") {
      return Number(totalSeconds.toFixed(2))
    }

    // ---------- normalize formatting ----------
    let remaining = totalSeconds

    const outHours = Math.floor(remaining / 3600)
    remaining %= 3600

    const outMinutes = Math.floor(remaining / 60)
    const outSeconds = remaining % 60

    const normalizedSeconds = outSeconds
      .toFixed(2)
      .replace(/\.?0+$/, "")

    const paddedSeconds =
      outSeconds < 10 ? `0${normalizedSeconds}` : normalizedSeconds

    const paddedMinutes =
      outHours > 0 && outMinutes < 10 ? `0${outMinutes}` : outMinutes

    if (outHours === 0) {
      return `${outMinutes}:${paddedSeconds}`
    }

    return `${outHours}:${paddedMinutes}:${paddedSeconds}`
  }

  return null
}

export function getTimestamp() {
  const now = new Date();

  // ISO string gives milliseconds (3 digits)
  const iso = now.toISOString(); // 2026-01-18T15:57:40.123Z

  // Expand milliseconds to microseconds
  return iso.replace(/\.(\d{3})Z$/, '.$1000Z');
}

export function convertCreatedAt(isoString, mode = "relative") {
  const date = new Date(isoString);
  const now = new Date();

  if (mode === "relative") {
    const diffMs = now - date;

    const seconds = Math.floor(diffMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days !== 1 ? "s" : ""} ago`;
    if (hours > 0) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
    if (minutes > 0) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
    return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
  }

  if (mode === "date") {
    const day = date.getUTCDate();
    const year = date.getUTCFullYear();

    const month = date.toLocaleString("en-US", {
      month: "long",
      timeZone: "UTC"
    });

    const suffix = getOrdinalSuffix(day);

    return `${day}${suffix} of ${month} ${year}`;
  }

  throw new Error("Mode must be 'relative' or 'date'");
}

export function timeAgo(isoTimestamp) {
  const now = new Date();
  const past = new Date(isoTimestamp);
  const seconds = Math.floor((now - past) / 1000);

  if (seconds < 60) {
    return `${seconds ?? 0} second${seconds !== 1 ? "s" : ""} ago`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  }

  const days = Math.floor(hours / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

export function secondsSince(isoTimestamp) {
  const past = new Date(isoTimestamp);

  if (isNaN(past.getTime())) {
    throw new Error("Invalid timestamp");
  }

  return Math.floor((Date.now() - past.getTime()) / 1000);
}


function getOrdinalSuffix(n) {
  if (n >= 11 && n <= 13) return "th";

  switch (n % 10) {
    case 1: return "st";
    case 2: return "nd";
    case 3: return "rd";
    default: return "th";
  }
}

export function secondsToDHMS(totalSeconds) {
  const units = [
    { label: 'd', value: Math.floor(totalSeconds / 86400) },
    { label: 'h', value: Math.floor((totalSeconds % 86400) / 3600) },
    { label: 'm', value: Math.floor((totalSeconds % 3600) / 60) },
    { label: 's', value: totalSeconds % 60 }
  ];

  const r = units
    .filter(u => u.value > 0)
    .map(u => `${u.value}${u.label}`)
    .join(' ');

  if (!r.trim().length) return "0s"
  return r
}