import encoding from 'encoding-japanese'

export class NemHelper {
  static qrJson(v: number, type: number, name: string, addr: string, amount: number, msg: string) {
    const params = { type, data: { name, addr, amount: amount * this.divisibility(), msg }, v }
    return encoding.codeToString(encoding.convert(this.getStr2Array(JSON.stringify(params)), 'UTF8'))
  }

  static divisibility(): number {
    return Math.pow(10, 6)
  }

  static networkLabel(network: number) {
    switch (network) {
      case 104:
        return 'MAIN_NET'
      case 152:
        return 'TEST_NET'
      case 96:
        return 'MIJIN'
      case 144:
        return 'MIJIN_TEST'
      default:
        return 'Unknow'
    }
  }

  static rentalBlock(day: number) {
     return day * 86400 / 15 // duration = numberOfDays * 86400 / blockGenerationTargetTime
  }

  private static getStr2Array(str: string) {
    const array = []
    for (let i = 0; i < str.length; i++) {
      array.push(str.charCodeAt(i))
    }
    return array
  }
}
