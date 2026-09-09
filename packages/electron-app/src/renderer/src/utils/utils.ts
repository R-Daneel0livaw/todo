import { CollectionSubType, CollectionType } from '@awesome-dev-journal/shared'

export const collectionTypes: CollectionType[] = [
  'QUARTERLY',
  'MONTHLY',
  'DAILY',
  'PROJECT',
  'CUSTOM'
]

export const collectionSubTypes: CollectionSubType[] = ['TASK', 'EVENT', 'PLAN', 'LOG', 'CUSTOM']

export const getDateParts = (dateInput: Date | string) => {
  // Dates arrive as ISO strings once they've crossed the IPC/HTTP boundary,
  // not real Date instances, even though the types claim otherwise.
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput)

  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }

  const formattedDate = new Intl.DateTimeFormat('en-US', dateOptions).format(date)

  const day = date.getDate()
  let daySuffix: string
  if (day > 3 && day < 21) daySuffix = 'th'
  else
    switch (day % 10) {
      case 1:
        daySuffix = 'st'
        break
      case 2:
        daySuffix = 'nd'
        break
      case 3:
        daySuffix = 'rd'
        break
      default:
        daySuffix = 'th'
    }

  const formattedDateWithSuffix = formattedDate.replace(day.toString(), day + daySuffix)

  const timeOptions: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }

  const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date)

  const timeZoneAbbreviation = date
    .toLocaleTimeString('en-US', { timeZoneName: 'short' })
    .split(' ')[2]

  const formattedTimeWithZone = `${formattedTime} ${timeZoneAbbreviation}`

  return {
    date: formattedDateWithSuffix,
    time: formattedTimeWithZone
  }
}

export const isSameDay = (a: Date | string, b: Date | string): boolean => {
  const dateA = a instanceof Date ? a : new Date(a)
  const dateB = b instanceof Date ? b : new Date(b)
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  )
}

export const toTitleCase = (str: string) => {
  return str.toLowerCase().replace(/\b\w/g, function (letter) {
    return letter.toUpperCase()
  })
}

export const validSubTypes: Record<CollectionType, CollectionSubType[]> = {
  DEFAULT: ['TASK', 'EVENT'],
  DAILY: ['TASK', 'EVENT', 'PLAN', 'LOG'],
  MONTHLY: ['TASK', 'EVENT'],
  QUARTERLY: ['TASK', 'EVENT'],
  PROJECT: ['TASK', 'EVENT'],
  CUSTOM: ['TASK', 'EVENT', 'CUSTOM']
}

export const allSubTypes: CollectionSubType[] = ['TASK', 'EVENT', 'PLAN', 'LOG', 'CUSTOM']
