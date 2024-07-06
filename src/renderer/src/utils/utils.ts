import { CollectionSubType, CollectionType } from '@shared/types'

export const collectionTypes: CollectionType[] = [
  'QUARTERLY',
  'MONTHLY',
  'DAILY',
  'PROJECT',
  'CUSTOM'
]

export const collectionSubTypes: CollectionSubType[] = ['TASK', 'EVENT', 'PLAN', 'LOG', 'CUSTOM']

export const getDateParts = (date: Date) => {
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
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
    second: 'numeric',
    hour12: true
  }

  const formattedTime = new Intl.DateTimeFormat('en-US', timeOptions).format(date)

  return {
    date: formattedDateWithSuffix,
    time: formattedTime
  }
}
