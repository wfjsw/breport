const numeral = require('numeral')
const { format, intervalToDuration, formatDistanceToNow } = require('date-fns')

const oneBillion = 1000000000
const tenMillion = 10000000
const oneMillion = 1000000
const tenThousand = 10000
const oneThousand = 1000

const MAX_TS = 2208988800 // 2040-01-01T00:00:00+00:00

// only three significant digits
const numberFormat = sum => {
  if (sum >= 100 * oneBillion) {
    return '0.0a'
  }
  if (sum >= 10 * oneBillion) {
    return '0.0a'
  }
  if (sum >= oneBillion) {
    return '0.00a'
  }
  if (sum >= 100 * oneMillion) {
    return '0a'
  }
  if (sum >= tenMillion) {
    return '0.0a'
  }
  if (sum >= oneMillion) {
    return '0.00a'
  }
  if (sum >= 100 * oneThousand) {
    return '0a'
  }
  if (sum >= tenThousand) {
    return '0.0a'
  }
  if (sum >= oneThousand) {
    return '0.00a'
  }
  return '0a'
}


const formatSum = sum => {
  if (sum === 0 || !sum) {
    return '0'
  }
  return numeral(sum).format(numberFormat(sum))
}

const formatDmg = dmg => {
  if (dmg === 0 || !dmg) {
    return '0'
  }
  return numeral(dmg).format(numberFormat(dmg))
}

const dmgPercent = dmg => (
  dmg === 0 || !dmg
    ? ''
    : `(${numeral(dmg).format('0,0.0%')})`
)

const dmgPercentZero = dmg => (
  dmg === 0 || !dmg
    ? '(0%)'
    : `(${numeral(dmg).format('0,0.0%')})`
)

const cntWhored = cnt => (
  cnt === 0 || !cnt ? '' : ` [${cnt}]`
)

const cntWhoredZero = cnt => (
  cnt === 0 || !cnt ? '[0]' : ` [${cnt}]`
)

const leadingZero = value => {
  if (value < 10) return `0${value}`
  return value
}

const getLocalTime = date => {
  let result = ''
  result += `${leadingZero(date.getHours())}`
  result += `:${leadingZero(date.leadingZero())}`
  return result
}

const getUTCTime = (date, withSeconds = true) => {
  let result = ''
  result += `${leadingZero(date.getUTCHours())}`
  result += `:${leadingZero(date.getUTCMinutes())}`
  if (withSeconds) {
    result += `:${leadingZero(date.getUTCSeconds())}`
  }
  return result
}

const timestampToLocal = timestamp => {
  const date = new Date(timestamp)
  return getLocalTime(date)
}

const timestampToUTC = timestamp => {
  const date = new Date(timestamp)
  return getUTCTime(date)
}

const formatZkillTimestamp = ts => {
  const date = new Date(ts * 1000)
  let dateStr = `${date.getUTCFullYear()}`
  const month = date.getUTCMonth() + 1
  dateStr += month > 9 ? month : `0${month}`
  const day = date.getUTCDate()
  dateStr += day > 9 ? day : `0${day}`
  const hour = date.getUTCHours()
  dateStr += hour > 9 ? hour : `0${hour}`
  dateStr += '00'
  return dateStr
}

const parseZkillDatetime = dt => {
  if (dt.length !== 12) return null
  const year = dt.substring(0, 4)
  const month = dt.substring(4, 6) - 1
  const day = dt.substring(6, 8)
  const hour = dt.substring(8, 10)
  const min = dt.substring(10)
  const timestamp = Date.UTC(year, month, day, hour, min)
  return new Date(timestamp)
}

const getDurationStr = (start, end) => {
  const interval = { start, end }
  if (start < MAX_TS) interval.start *= 1000
  if (end < MAX_TS) interval.end *= 1000

  const { hours, minutes, seconds } = intervalToDuration(interval)
  const duration = []
  if (hours > 0) duration.push(`${hours}h`)
  if (minutes > 0) duration.push(`${minutes}m`)
  if (seconds > 0) duration.push(`${seconds}s`)
  if (duration.length === 0) return '0'
  return duration.join(' ')
}

const shortTimeAgo = date => {
  const str = formatDistanceToNow(date, { addSuffix: true })
  return str
    .replace('about ', '')
    .replace('hours', 'hrs')
    .replace('hour', 'hr')
    .replace('minutes', 'min')
    .replace('minute', 'min')
}

const formatDate = date => format(date, 'd/MMM/yy HH:mm')

const formatPeriod = (start, end) => {
  // TODO: if year !== current => 'd MMM yyyy HH:mm'
  let result = format(new Date(start * 1000), 'd MMM HH:mm')
  result += `-${format(new Date(end * 1000), 'HH:mm')}`
  return result
}

module.exports = {
  formatSum,
  formatDmg,
  dmgPercent,
  dmgPercentZero,
  cntWhored,
  cntWhoredZero,
  getLocalTime,
  getUTCTime,
  timestampToLocal,
  timestampToUTC,
  formatZkillTimestamp,
  parseZkillDatetime,
  getDurationStr,
  shortTimeAgo,
  formatDate,
  formatPeriod,
}
