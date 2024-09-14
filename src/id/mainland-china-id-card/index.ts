import pcaCode from './data/pca-code.json'

interface IdOptions {
  gender?: 'male' | 'female'
  birthDate?: Date
  areaCode?: string
  useOldFormat?: boolean
}

interface Area {
  code: string
  name: string
  children?: Area[]
}

function getRandomArea(areas: Area[]): string {
  const province = areas[Math.floor(Math.random() * areas.length)]
  const city = province.children![Math.floor(Math.random() * province.children!.length)]
  const district = city.children![Math.floor(Math.random() * city.children!.length)]
  return district.code
}

function generateRandomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function generateChecksum(idNumber: string): string {
  const weight = [7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2]
  const checkCodes = ['1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2']

  let sum = 0
  for (let i = 0; i < 17; i++) {
    sum += Number.parseInt(idNumber[i]) * weight[i]
  }

  return checkCodes[sum % 11]
}

function validateIdNumber(idNumber: string): boolean {
  // 验证长度
  if (idNumber.length !== 18 && idNumber.length !== 15) {
    return false
  }

  // 验证地区码
  const areaCode = idNumber.substring(0, 6)
  const area = findArea(pcaCode as Area[], areaCode)
  if (!area) {
    return false
  }

  // 验证出生日期
  let birthDate: Date
  if (idNumber.length === 18) {
    birthDate = new Date(
      Number.parseInt(idNumber.substring(6, 10)),
      Number.parseInt(idNumber.substring(10, 12)) - 1,
      Number.parseInt(idNumber.substring(12, 14)),
    )
  }
  else {
    birthDate = new Date(
      1900 + Number.parseInt(idNumber.substring(6, 8)),
      Number.parseInt(idNumber.substring(8, 10)) - 1,
      Number.parseInt(idNumber.substring(10, 12)),
    )
  }
  if (Number.isNaN(birthDate.getTime())) {
    return false
  }

  // 验证性别
  const genderDigit = Number.parseInt(idNumber.charAt(idNumber.length - 2))
  if (Number.isNaN(genderDigit)) {
    return false
  }

  return true
}

function findArea(areas: Area[], code: string): Area | undefined {
  for (const province of areas) {
    if (province.code === code.substring(0, 2)) {
      for (const city of province.children || []) {
        if (city.code === code.substring(0, 4)) {
          for (const district of city.children || []) {
            if (district.code === code) {
              return district
            }
          }
        }
      }
    }
  }
  return undefined
}

export function generateChineseId(options: IdOptions = {}): string {
  let idNumber: string

  // 生成身份证号码
  if (options.useOldFormat) {
    // 15-digit format
    const areaCode = options.areaCode || getRandomArea(pcaCode as Area[])
    const birthDate = options.birthDate || generateRandomDate(new Date(1950, 0, 1), new Date(2003, 11, 31))
    const year = birthDate.getFullYear()
    const month = (birthDate.getMonth() + 1).toString().padStart(2, '0')
    const day = birthDate.getDate().toString().padStart(2, '0')
    const sequenceNumber = Math.floor(Math.random() * 999).toString().padStart(3, '0')
    const isFemaleBit = options.gender === 'female' ? 0 : (options.gender === 'male' ? 1 : Math.round(Math.random()))
    const genderDigit = (Number.parseInt(sequenceNumber[2]) & ~1) | isFemaleBit
    idNumber = `${areaCode}${year.toString().slice(-2)}${month}${day}${sequenceNumber.slice(0, 2)}${genderDigit}`
  }
  else {
    // 18-digit format
    const areaCode = options.areaCode || getRandomArea(pcaCode as Area[])
    const birthDate = options.birthDate || generateRandomDate(new Date(1950, 0, 1), new Date(2003, 11, 31))
    const year = birthDate.getFullYear()
    const month = (birthDate.getMonth() + 1).toString().padStart(2, '0')
    const day = birthDate.getDate().toString().padStart(2, '0')
    const sequenceNumber = Math.floor(Math.random() * 999).toString().padStart(3, '0')
    const isFemaleBit = options.gender === 'female' ? 0 : (options.gender === 'male' ? 1 : Math.round(Math.random()))
    const genderDigit = (Number.parseInt(sequenceNumber[2]) & ~1) | isFemaleBit
    idNumber = `${areaCode}${year}${month}${day}${sequenceNumber.slice(0, 2)}${genderDigit}`
    const checksum = generateChecksum(idNumber)
    idNumber += checksum
  }

  if (!validateIdNumber(idNumber)) {
    // If the generated ID is not valid, try again
    return generateChineseId(options)
  }

  return idNumber
}
