import encoding from 'encoding-japanese'

export class NemHelper {
  static qrJson(v: number, type: number, name: string, addr: string, amount: number, msg: string) {
    const params = { type, data: { name, addr, amount: amount * this.divisibility(), msg }, v }
    return encoding.codeToString(encoding.convert(this.getStr2Array(JSON.stringify(params)), 'UTF8'))
  }

  static divisibility(): number {
    return Math.pow(10, 6)
  }

  private static getStr2Array(str: string) {
    const array = []
    for (let i = 0; i < str.length; i++) {
      array.push(str.charCodeAt(i))
    }
    return array
  }
}
