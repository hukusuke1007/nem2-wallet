export class NemNode {
  endpoint: string
  wsEndpoint: string
  host: string
  port: string
  network: number
  networkGenerationHash: string
  constructor(host: string, ws: string, port: string, network: number, networkGenerationHash: string) {
    this.host = host
    this.port = port
    this.network = network
    this.networkGenerationHash = networkGenerationHash
    this.endpoint = `${host}:${port}`
    this.wsEndpoint = `${ws}:${port}`
  }
}
